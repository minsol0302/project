# -*- coding: utf-8 -*-
"""
Learning API Router
라우터 레이어: 요청/응답 처리만 담당
비즈니스 로직: domain.learning.service에서 처리
"""
from fastapi import APIRouter, Depends, HTTPException, Request as FastAPIRequest
from pydantic import BaseModel
from typing import Optional
import json
import uuid

from core.database import get_pool
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.security import verify_access_token
from domain.learning.repository import LearningRepository
from domain.learning.service import LearningService

router = APIRouter()
_security = HTTPBearer(auto_error=False)

async def _get_user_id(
    request: FastAPIRequest,
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    # Authorization 헤더에서 토큰 확인
    if credentials:
        payload = verify_access_token(credentials.credentials)
        if payload:
            return payload["sub"]
    
    # sendBeacon 등에서 헤더가 없을 경우 쿠키에서 토큰 확인
    cookie_token = request.cookies.get("vding_auth")
    if cookie_token:
        payload = verify_access_token(cookie_token)
        if payload:
            return payload["sub"]
    
    raise HTTPException(status_code=401, detail="인증 정보가 없습니다.")

class UpdateProgressRequest(BaseModel):
    stage_id: Optional[str] = None
    step_id: Optional[str] = None
    completed: bool = False
    completed_stages: Optional[list[str]] = None
    completed_steps: Optional[list[str]] = None
    progress_pct: Optional[int] = None


@router.get("/")
async def get_learning():
    """학습 콘텐츠 목록 조회 (Neon DB)"""
    pool = await get_pool()
    repo = LearningRepository(pool)
    service = LearningService(repo)
    
    result = await service.get_learning_list()
    return {
        "message": result.message,
        "data": [
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "category": item.category,
                "thumbnail_url": item.thumbnail_url,
                "author": item.author,
                "duration_min": item.duration_min,
                "created_at": item.created_at,
                "content": item.content,
                "video_url": item.video_url,
                "participant_count": item.participant_count,
                "tags": item.tags,
                "stage_count": item.stage_count,
            }
            for item in result.data
        ],
    }


@router.get("/{content_id}")
async def get_learning_detail(content_id: str):
    """학습 콘텐츠 상세 조회"""
    import logging
    logger = logging.getLogger(__name__)
    
    pool = await get_pool()
    repo = LearningRepository(pool)
    service = LearningService(repo)
    
    logger.debug(f"[Learning API] Fetching content_id: {content_id}")
    item = await service.get_learning_content(content_id)
    
    if not item:
        logger.warning(f"[Learning API] Content not found: {content_id}")
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Learning content not found: {content_id}")
    
    return {
        "success": True,
        "data": {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "thumbnail_url": item.thumbnail_url,
            "author": item.author,
            "duration_min": item.duration_min,
            "created_at": item.created_at,
            "content": item.content,
            "video_url": item.video_url,
            "participant_count": item.participant_count,
            "tags": item.tags,
            "stage_count": item.stage_count,
        },
    }


@router.get("/{content_id}/progress")
async def get_learning_progress(
    content_id: str,
    request: FastAPIRequest,
    user_id: str = Depends(_get_user_id),
):
    """학습 진행 상태 조회"""
    pool = await get_pool()
    repo = LearningRepository(pool)
    service = LearningService(repo)
    
    progress = await service.get_learning_progress(user_id, content_id)
    
    if not progress:
        return {
            "success": True,
            "data": {
                "content_id": content_id,
                "last_stage_id": None,
                "last_step_id": None,
                "completed_stages": [],
                "completed_steps": [],
                "progress_pct": 0,
            },
        }
    
    return {
        "success": True,
        "data": {
            "content_id": progress.content_id,
            "last_stage_id": progress.last_stage_id,
            "last_step_id": progress.last_step_id,
            "completed_stages": progress.completed_stages,
            "completed_steps": progress.completed_steps,
            "progress_pct": progress.progress_pct,
        },
    }


@router.post("/{content_id}/progress")
async def update_learning_progress(
    content_id: str,
    request_body: UpdateProgressRequest,
    request: FastAPIRequest,
    user_id: str = Depends(_get_user_id),
):
    """학습 진행 상태 업데이트"""
    pool = await get_pool()
    repo = LearningRepository(pool)
    service = LearningService(repo)
    
    # completed_stages와 completed_steps가 제공되면 사용, 아니면 기존 로직 사용
    if request_body.completed_stages is not None and request_body.completed_steps is not None:
        # 직접 업데이트 (sendBeacon 등에서 사용)
        progress = await repo.upsert_learning_progress(
            user_id,
            content_id,
            request_body.stage_id,
            request_body.step_id,
            request_body.completed,
        )
        # completed_stages와 completed_steps를 직접 설정
        async with pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE vding_learning_progress
                SET completed_stages = $1,
                    completed_steps = $2,
                    progress_pct = COALESCE($3, progress_pct),
                    updated_at = NOW()
                WHERE user_id = $4 AND content_id = $5
                """,
                json.dumps(request_body.completed_stages) if request_body.completed_stages else None,
                json.dumps(request_body.completed_steps) if request_body.completed_steps else None,
                request_body.progress_pct,
                uuid.UUID(user_id),
                uuid.UUID(content_id),
            )
        progress = await service.get_learning_progress(user_id, content_id)
    else:
        # 기존 로직 (단계 완료 시)
        progress = await service.update_learning_progress(
            user_id,
            content_id,
            request_body.stage_id,
            request_body.step_id,
            request_body.completed,
        )
    
    return {
        "success": True,
        "data": {
            "content_id": progress.content_id,
            "last_stage_id": progress.last_stage_id,
            "last_step_id": progress.last_step_id,
            "completed_stages": progress.completed_stages,
            "completed_steps": progress.completed_steps,
            "progress_pct": progress.progress_pct,
        },
    }
