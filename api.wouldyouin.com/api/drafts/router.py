# -*- coding: utf-8 -*-
"""
Drafts API Router
라우터 레이어: 요청/응답 처리만 담당
비즈니스 로직: domain.drafts.service에서 처리
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from core.database import get_pool
from core.security import verify_access_token
from domain.drafts.dto import DraftSaveRequestDTO
from domain.drafts.repository import DraftsRepository
from domain.drafts.service import DraftsService

router = APIRouter()
_security = HTTPBearer(auto_error=False)


def _get_user_id(creds: HTTPAuthorizationCredentials = Depends(_security)) -> str:
    if not creds:
        raise HTTPException(status_code=401, detail="Auth required")
    payload = verify_access_token(creds.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


class DraftSaveRequest(BaseModel):
    draft_id: Optional[str] = None
    caption: str = ""
    location: str = ""
    hashtags: List[str] = []
    thumbnail_idx: int = 0


@router.post("/save", summary="임시저장 (upsert)")
async def save_draft(body: DraftSaveRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = DraftsRepository(pool)
    service = DraftsService(repo)
    
    dto = DraftSaveRequestDTO(
        draft_id=body.draft_id,
        caption=body.caption,
        location=body.location,
        hashtags=body.hashtags,
        thumbnail_idx=body.thumbnail_idx,
    )
    result = await service.save_draft(user_id, dto)
    return {
        "success": result.success,
        "draft_id": result.draft_id,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
    }


@router.get("", summary="임시저장 목록")
async def list_drafts(user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = DraftsRepository(pool)
    service = DraftsService(repo)
    
    result = await service.list_drafts(user_id)
    return {
        "drafts": [
            {
                "id": d.id,
                "caption": d.caption,
                "location": d.location,
                "hashtags": d.hashtags,
                "thumbnail_idx": d.thumbnail_idx,
                "updated_at": d.updated_at,
                "created_at": d.created_at,
            }
            for d in result.drafts
        ],
        "count": result.count,
    }


@router.get("/{draft_id}", summary="임시저장 상세")
async def get_draft(draft_id: str, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = DraftsRepository(pool)
    service = DraftsService(repo)
    
    result = await service.get_draft(draft_id, user_id)
    return {
        "id": result.id,
        "caption": result.caption,
        "location": result.location,
        "hashtags": result.hashtags,
        "thumbnail_idx": result.thumbnail_idx,
        "updated_at": result.updated_at,
        "created_at": result.created_at,
    }


@router.delete("/{draft_id}", summary="임시저장 삭제")
async def delete_draft(draft_id: str, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = DraftsRepository(pool)
    service = DraftsService(repo)
    
    return await service.delete_draft(draft_id, user_id)
