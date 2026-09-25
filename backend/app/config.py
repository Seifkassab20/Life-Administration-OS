from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/life_admin_os"
    SQLITE_FALLBACK: bool = True
    SQLITE_DATABASE_PATH: str = str(BASE_DIR / "life_admin.db")

    # Storage
    STORAGE_BACKEND: str = "local"  # 'local' or 'supabase'
    LOCAL_STORAGE_DIR: str = str(BASE_DIR / "storage")
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "documents"
    SUPABASE_JWT_SECRET: str = ""

    # AI & LLM Providers
    LLM_PROVIDER: str = "rule_based"  # 'rule_based', 'gemini', 'openai', 'groq'
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Security & Demo
    DEMO_USER_ID: str = "00000000-0000-0000-0000-000000000001"
    DEMO_USER_EMAIL: str = "seif@example.com"
    DEMO_USER_NAME: str = "Seif Kassab"
    JWT_SECRET_KEY: str = "life-admin-os-super-secret-jwt-key-for-development-only-replace-in-production"
    JWT_ALGORITHM: str = "HS256"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
