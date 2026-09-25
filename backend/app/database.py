import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("life_admin.database")

Base = declarative_base()

# Determine database engine
is_sqlite = False
engine_url = settings.DATABASE_URL

if "sqlite" in engine_url:
    is_sqlite = True
elif settings.SQLITE_FALLBACK:
    # We will test connection or use SQLite if Postgres isn't reachable
    pass

try:
    if "sqlite" in engine_url:
        engine = create_async_engine(
            engine_url,
            connect_args={"check_same_thread": False},
            echo=False
        )
        is_sqlite = True
    else:
        engine = create_async_engine(
            engine_url,
            pool_pre_ping=True,
            echo=False
        )
except Exception as e:
    logger.warning(f"Failed to create postgres async engine: {e}. Falling back to SQLite.")
    sqlite_url = f"sqlite+aiosqlite:///{settings.SQLITE_DATABASE_PATH}"
    engine = create_async_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=False
    )
    is_sqlite = True

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_database():
    """Initializes tables on startup if they do not exist."""
    global engine, is_sqlite
    try:
        async with engine.begin() as conn:
            from app.models import (  # noqa
                Profile, Document, DocumentField, DocumentChunk, Reminder, ProcessingJob
            )
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables initialized successfully.")
    except Exception as e:
        if settings.SQLITE_FALLBACK and not is_sqlite:
            logger.warning(f"Could not connect to PostgreSQL ({e}). Initializing SQLite fallback...")
            sqlite_url = f"sqlite+aiosqlite:///{settings.SQLITE_DATABASE_PATH}"
            engine = create_async_engine(
                sqlite_url,
                connect_args={"check_same_thread": False},
                echo=False
            )
            is_sqlite = True
            AsyncSessionLocal.configure(bind=engine)
            async with engine.begin() as conn:
                from app.models import (  # noqa
                    Profile, Document, DocumentField, DocumentChunk, Reminder, ProcessingJob
                )
                await conn.run_sync(Base.metadata.create_all)
            logger.info("SQLite fallback database initialized successfully.")
        else:
            raise e
