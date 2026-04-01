# -*- coding: utf-8 -*-
"""
Learning Service
"""
from typing import Optional
from domain.learning.dto import LearningListResponseDTO, LearningContentDTO
from domain.learning.repository import LearningRepository
from domain.learning.progress_entity import LearningProgressEntity


class LearningService:
    def __init__(self, repo: LearningRepository) -> None:
        self._repo = repo

    async def get_learning_list(self) -> LearningListResponseDTO:
        """학습 콘텐츠 목록 조회"""
        entities = await self._repo.get_learning_contents()
        data = [
            LearningContentDTO(
                id=e.id,
                title=e.title,
                description=e.description,
                category=e.category,
                thumbnail_url=e.thumbnail_url,
                author=e.author,
                duration_min=e.duration_min,
                created_at=e.created_at,
                content=e.content,
                video_url=e.video_url,
                participant_count=e.participant_count,
                tags=e.tags or [],
                stage_count=e.stage_count,
            )
            for e in entities
        ]
        return LearningListResponseDTO(message="학습 콘텐츠 목록", data=data)

    async def get_learning_content(self, content_id: str) -> Optional[LearningContentDTO]:
        """학습 콘텐츠 상세 조회"""
        entity = await self._repo.get_learning_content_by_id(content_id)
        if not entity:
            return None
        return LearningContentDTO(
            id=entity.id,
            title=entity.title,
            description=entity.description,
            category=entity.category,
            thumbnail_url=entity.thumbnail_url,
            author=entity.author,
            duration_min=entity.duration_min,
            created_at=entity.created_at,
            content=entity.content,
            video_url=entity.video_url,
            participant_count=entity.participant_count,
            tags=entity.tags or [],
            stage_count=entity.stage_count,
        )

    async def get_learning_progress(
        self, user_id: str, content_id: str
    ) -> Optional[LearningProgressEntity]:
        """학습 진행 상태 조회"""
        return await self._repo.get_learning_progress(user_id, content_id)

    async def update_learning_progress(
        self,
        user_id: str,
        content_id: str,
        stage_id: Optional[str] = None,
        step_id: Optional[str] = None,
        completed: bool = False,
    ) -> LearningProgressEntity:
        """학습 진행 상태 업데이트"""
        return await self._repo.upsert_learning_progress(
            user_id, content_id, stage_id, step_id, completed
        )
