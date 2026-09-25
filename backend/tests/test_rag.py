import pytest
from app.services.llm import RuleBasedLLMProvider

@pytest.mark.asyncio
async def test_grounded_answer_found():
    provider = RuleBasedLLMProvider()
    context = [
        {
            "document_id": "doc-ins",
            "document_title": "Comprehensive Motor Insurance",
            "page_number": 1,
            "content": "شركة مصر للتأمين\nوثيقة تأمين شامل\nExpiry Date: 2026-11-18\nAmount: 850,000 EGP"
        }
    ]

    res = await provider.generate_grounded_answer("When does my vehicle insurance expire?", context)
    assert res["grounded"] is True
    assert "2026-11-18" in res["answer"]
    assert "Comprehensive Motor Insurance" in res["answer"]

@pytest.mark.asyncio
async def test_anti_hallucination_when_not_found():
    provider = RuleBasedLLMProvider()
    context = []

    res = await provider.generate_grounded_answer("What is the serial number of my microwave?", context)
    assert res["grounded"] is False
    assert "I couldn't find that information in your documents." in res["answer"]
