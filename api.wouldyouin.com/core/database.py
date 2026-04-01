import logging
import asyncpg
from core.config import settings

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        dsn = settings.database_url
        if not dsn:
            logger.error(
                "[Database] DATABASE_URL is empty. "
                "Set DATABASE_URL or NEON_DB_URL env var. "
                "Checked: DATABASE_URL='%s' NEON_DB_URL='%s'",
                settings.DATABASE_URL,
                settings.NEON_DB_URL,
            )
            raise RuntimeError(
                "Database URL is not configured. "
                "Please set DATABASE_URL or NEON_DB_URL environment variable."
            )
        ssl = "require" if "neon.tech" in dsn else None
        logger.info("[Database] connecting to DB ssl=%s", ssl)
        _pool = await asyncpg.create_pool(
            dsn=dsn,
            ssl=ssl,
            min_size=1,
            max_size=10,
            command_timeout=60,
        )
        logger.info("[Database] pool created successfully")
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
