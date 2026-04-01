from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.config import settings
from core.database import get_pool, close_pool

# NOTE: 로컬 파일 저장은 더 이상 사용하지 않습니다.
# 모든 이미지는 AWS S3에 저장됩니다.
# S3 업로드는 core.s3.upload_to_s3()를 통해 수행됩니다.


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: DB 커넥션 풀 초기화
    await get_pool()
    from domain.vding_editor.init_tables import create_vding_editor_tables
    await create_vding_editor_tables()
    # VDing Editor 테이블 초기화
    from api.vding_editor.repository import init_vding_tables
    await init_vding_tables()
    yield
    # Shutdown: 풀 반환
    await close_pool()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="WouldYouIn SNS 백엔드 API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# NOTE: 로컬 정적 파일 서빙은 제거되었습니다.
# 모든 이미지는 S3에 저장되며, S3 URL을 통해 직접 접근합니다.
# 예: https://jimin260307-vding.s3.ap-northeast-2.amazonaws.com/users/{user_id}/posts/...


@app.get("/", tags=["루트"])
async def root():
    """루트 엔드포인트"""
    return {
        "status": "ok",
        "message": "WouldYouIn API",
        "version": settings.VERSION,
        "docs": "/docs",
    }

@app.get("/health", tags=["헬스체크"])
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
