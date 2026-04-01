# -*- coding: utf-8 -*-
"""
Drafts Service
"""
from typing import Optional
from fastapi import HTTPException

from domain.drafts.dto import (
    DraftSaveRequestDTO,
    DraftSaveResponseDTO,
    DraftListResponseDTO,
    DraftResponseDTO,
)
from domain.drafts.repository import DraftsRepository


class DraftsService:
    def __init__(self, repo: DraftsRepository) -> None:
        self._repo = repo

    async def save_draft(
        self, user_id: str, dto: DraftSaveRequestDTO
    ) -> DraftSaveResponseDTO:
        """임시저장 (upsert)"""
        try:
            entity = await self._repo.save_draft(
                user_id,
                dto.draft_id,
                dto.caption,
                dto.location,
                dto.hashtags or [],
                dto.thumbnail_idx,
            )
            return DraftSaveResponseDTO(
                success=True,
                draft_id=entity.id,
                created_at=entity.created_at if not dto.draft_id else None,
                updated_at=entity.updated_at if dto.draft_id else None,
            )
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    async def list_drafts(self, user_id: str) -> DraftListResponseDTO:
        """임시저장 목록 조회"""
        entities = await self._repo.list_drafts(user_id)
        drafts = [
            DraftResponseDTO(
                id=e.id,
                caption=e.caption,
                location=e.location,
                hashtags=e.hashtags,
                thumbnail_idx=e.thumbnail_idx,
                updated_at=e.updated_at,
                created_at=e.created_at,
            )
            for e in entities
        ]
        return DraftListResponseDTO(drafts=drafts, count=len(drafts))

    async def get_draft(self, draft_id: str, user_id: str) -> DraftResponseDTO:
        """임시저장 상세 조회"""
        entity = await self._repo.get_draft(draft_id, user_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        return DraftResponseDTO(
            id=entity.id,
            caption=entity.caption,
            location=entity.location,
            hashtags=entity.hashtags,
            thumbnail_idx=entity.thumbnail_idx,
            updated_at=entity.updated_at,
            created_at=entity.created_at,
        )

    async def delete_draft(self, draft_id: str, user_id: str) -> dict:
        """임시저장 삭제"""
        success = await self._repo.delete_draft(draft_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Draft not found")
        return {"success": True, "message": "Draft deleted"}
