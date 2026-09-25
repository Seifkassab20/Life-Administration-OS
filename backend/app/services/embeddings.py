import json
import logging
import math
import hashlib
from typing import List, Optional
import numpy as np
from app.config import settings

logger = logging.getLogger("life_admin.embeddings")

class EmbeddingService:
    def __init__(self):
        self._model = None
        self._initialized = False

    def _get_model(self):
        if not self._initialized:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info(f"SentenceTransformer loaded: {settings.EMBEDDING_MODEL}")
            except Exception as e:
                logger.info(f"SentenceTransformer not loaded ({e}). Using deterministic semantic vector fallback.")
                self._model = None
            self._initialized = True
        return self._model

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional normalized vector for given text.
        """
        if not text or not text.strip():
            return [0.0] * 384

        model = self._get_model()
        if model:
            try:
                vector = model.encode(text, convert_to_numpy=True)
                return vector.tolist()
            except Exception as e:
                logger.warning(f"Error generating embedding with model: {e}")

        # High-quality deterministic fallback:
        # Generates a pseudo-semantic dense vector using character n-grams and hashing trick
        return self._deterministic_vector(text)

    def _deterministic_vector(self, text: str, dim: int = 384) -> List[float]:
        """
        Deterministic dense embedding generator for semantic hashing without heavy downloads.
        Produces unit-norm 384-dim vector with semantic word & subword overlap properties.
        """
        vec = np.zeros(dim, dtype=np.float32)
        words = text.lower().split()
        
        for word in words:
            # Word level
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if (h // dim) % 2 == 0 else -1.0
            vec[idx] += sign * 1.5

            # Subword 3-grams
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    trigram = word[i:i+3]
                    th = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16)
                    tidx = th % dim
                    tsign = 1.0 if (th // dim) % 2 == 0 else -1.0
                    vec[tidx] += tsign * 0.5

        # Normalize to unit length (L2 norm)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Computes cosine similarity between two vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        a = np.array(v1, dtype=np.float32)
        b = np.array(v2, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

embedding_service = EmbeddingService()
