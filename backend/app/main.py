import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_database, AsyncSessionLocal
from app.demo.seed_data import seed_demo_data
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.reminders import router as reminders_router
from app.api.assistant import router as assistant_router
from app.api.search import router as search_router
from app.api.dashboard import router as dashboard_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("life_admin")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed demo data
    logger.info("Starting Life Administration OS Backend...")
    await init_database()
    async with AsyncSessionLocal() as session:
        try:
            await seed_demo_data(session)
            logger.info("Demo dataset verified/seeded successfully.")
        except Exception as e:
            logger.warning(f"Demo data seeding notice: {e}")
    yield
    # Shutdown
    logger.info("Shutting down Life Administration OS Backend...")

app = FastAPI(
    title="Life Administration OS API",
    description="Privacy-first AI-powered personal document management system designed for life administration.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(reminders_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Life Administration OS API",
        "environment": settings.ENVIRONMENT,
        "storage_backend": settings.STORAGE_BACKEND,
        "llm_provider": settings.LLM_PROVIDER
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Welcome to Life Administration OS API",
        "docs": "/docs",
        "version": "1.0.0"
    }
