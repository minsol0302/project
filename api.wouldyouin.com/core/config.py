from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "WouldYouIn API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://www.wouldyouin.com",
        "https://wouldyouin.com",
    ]

    # Gemini API
    GEMINI_API_KEY: str = ""

    # Database - Neon PostgreSQL
    # Set DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
    DATABASE_URL: str = ""
    NEON_DB_URL: str = ""        # JDBC format fallback (jdbc:postgresql://...)
    NEON_DB_USERNAME: str = ""
    NEON_DB_PASSWORD: str = ""

    # JWT
    JWT_SECRET: str = "wouldyouin-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-northeast-2"

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # JDBC URL → asyncpg format
        # jdbc:postgresql://hostname/dbname → postgresql://user:pass@hostname/dbname
        url = self.NEON_DB_URL.replace("jdbc:", "")
        if "://" in url and self.NEON_DB_USERNAME:
            proto, rest = url.split("://", 1)
            return f"{proto}://{self.NEON_DB_USERNAME}:{self.NEON_DB_PASSWORD}@{rest}"
        return url

    class Config:
        # 프로젝트 루트 .env 만 읽음 — 상위 폴더에 의존하지 않음
        # 프로덕션(ECS/EC2): --env-file /path/.env 또는 AWS Secrets Manager 사용
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
