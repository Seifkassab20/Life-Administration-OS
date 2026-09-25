import logging
import json
import re
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("life_admin.llm")

SYSTEM_GROUNDED_PROMPT = """
You are the Life Administration OS AI Document Assistant.
Your job is to answer user questions strictly based on the provided document excerpts and structured fields.

CRITICAL RULES:
1. Every factual claim MUST be grounded in the provided document excerpts.
2. If the user asks about an expiration date, due date, name, number, or price, quote the exact value and document title.
3. If the answer cannot be determined from the excerpts, respond EXACTLY:
   "I couldn't find that information in your documents."
4. Do NOT speculate, extrapolate, or mention outside knowledge.
5. Provide a helpful, clear, and concise answer formatted with markdown.
6. Clearly cite your sources at the end if applicable.
"""

class LLMProvider:
    async def generate_grounded_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError

class GeminiLLMProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_grounded_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        try:
            import httpx
            context_text = "\n\n".join([
                f"[Document: {c.get('document_title', 'Untitled')} (Page {c.get('page_number', 1)})]\n{c.get('content', '')}"
                for c in context_chunks
            ])

            prompt = f"{SYSTEM_GROUNDED_PROMPT}\n\nDocument Context:\n{context_text}\n\nUser Question: {query}"
            models_to_try = ["gemini-3.8-flash", "gemini-flash-latest"]

            async with httpx.AsyncClient(timeout=25.0) as client:
                for model in models_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                    try:
                        res = await client.post(
                            url,
                            headers={"x-goog-api-key": self.api_key, "Content-Type": "application/json"},
                            json={"contents": [{"parts": [{"text": prompt}]}]}
                        )
                        if res.status_code == 200:
                            data = res.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                # Filter out internal thought parts if present
                                text_parts = [p.get("text", "") for p in parts if not p.get("thought", False) and "text" in p]
                                answer = "".join(text_parts).strip() if text_parts else candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                                return {
                                    "answer": answer,
                                    "grounded": "couldn't find" not in answer.lower()
                                }
                    except Exception as req_err:
                        logger.warning(f"Error querying Gemini model {model}: {req_err}")
                        continue

            return RuleBasedLLMProvider().generate_grounded_answer_sync(query, context_chunks)
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return RuleBasedLLMProvider().generate_grounded_answer_sync(query, context_chunks)


class OpenAILLMProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_grounded_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        try:
            import httpx
            context_text = "\n\n".join([
                f"[Document: {c['document_title']} (Page {c['page_number']})]\n{c['content']}"
                for c in context_chunks
            ])

            messages = [
                {"role": "system", "content": SYSTEM_GROUNDED_PROMPT},
                {"role": "user", "content": f"Document Context:\n{context_text}\n\nUser Question: {query}"}
            ]

            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.1}
                )
                data = res.json()
                answer = data["choices"][0]["message"]["content"].strip()
                return {
                    "answer": answer,
                    "grounded": "couldn't find" not in answer.lower()
                }
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return RuleBasedLLMProvider().generate_grounded_answer_sync(query, context_chunks)

class RuleBasedLLMProvider(LLMProvider):
    """
    High-precision grounded generator that extracts facts directly from documents
    without hallucinations, ensuring complete zero-cost offline reliability.
    """
    async def generate_grounded_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        return self.generate_grounded_answer_sync(query, context_chunks)

    def generate_grounded_answer_sync(self, query: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        q_lower = query.lower()

        if not context_chunks:
            return {
                "answer": "I couldn't find that information in your documents.",
                "grounded": False
            }

        # Check for expiry date question
        if any(w in q_lower for w in ["expire", "expiry", "expiration", "ends", "ينتهي", "انتهاء", "صلاحية"]):
            for chunk in context_chunks:
                text = chunk["content"]
                title = chunk["document_title"]
                match = re.search(r"(?:expiry|expires|expires on|تاريخ الانتهاء|تاريخ انتهاء)[:\s]+([^\n\r,]+)", text, re.IGNORECASE)
                if match:
                    val = match.group(1).strip()
                    return {
                        "answer": f"Your **{title}** expires on **{val}**.",
                        "grounded": True
                    }
                # Check for standard date pattern
                date_match = re.search(r"\b(20\d\d[-/]\d\d[-/]\d\d)\b", text)
                if date_match:
                    return {
                        "answer": f"According to your **{title}**, the recorded date is **{date_match.group(1)}**.",
                        "grounded": True
                    }

        # Check for bill / cost / price / amount questions
        if any(w in q_lower for w in ["bill", "amount", "cost", "how much", "فاتورة", "مبلغ", "سعر", "فلوس"]):
            for chunk in context_chunks:
                text = chunk["content"]
                title = chunk["document_title"]
                amount_match = re.search(r"(?:amount due|total|amount|المبلغ المطلوب|الإجمالي)[:\s]+([^\n\r,]+)", text, re.IGNORECASE)
                if amount_match:
                    val = amount_match.group(1).strip()
                    return {
                        "answer": f"Your **{title}** has an amount due of **{val}**.",
                        "grounded": True
                    }

        # Check for car / vehicle related questions
        if any(w in q_lower for w in ["car", "vehicle", "سيارة", "عربية", "مركبة"]):
            vehicle_docs = set()
            for chunk in context_chunks:
                t = chunk["document_title"]
                if any(k in t.lower() for k in ["vehicle", "license", "insurance", "car", "رخصة", "تأمين", "سيارة"]):
                    vehicle_docs.add(t)
            if vehicle_docs:
                items_str = "\n".join([f"• {doc}" for doc in sorted(vehicle_docs)])
                return {
                    "answer": f"I found {len(vehicle_docs)} document(s) related to your vehicle:\n\n{items_str}",
                    "grounded": True
                }

        # General grounded excerpt synthesis
        best_chunk = context_chunks[0]
        title = best_chunk["document_title"]
        page = best_chunk.get("page_number", 1)
        content_preview = best_chunk["content"].strip().replace("\n", " ")
        if len(content_preview) > 200:
            content_preview = content_preview[:197] + "..."

        return {
            "answer": f"Based on your **{title}** (Page {page}):\n\n> {content_preview}",
            "grounded": True
        }

def get_llm_provider() -> LLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(settings.GEMINI_API_KEY)
    elif provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider(settings.OPENAI_API_KEY)
    else:
        return RuleBasedLLMProvider()

llm_service = get_llm_provider()
