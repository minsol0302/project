# -*- coding: utf-8 -*-
"""
Learning Repository
"""
import json
import uuid
from typing import List, Optional
import asyncpg

from domain.learning.entity import LearningContentEntity
from domain.learning.progress_entity import LearningProgressEntity


class LearningRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def get_learning_contents(self) -> List[LearningContentEntity]:
        """학습 콘텐츠 목록 조회"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, title, description, category, thumbnail_url,
                       author, duration_min, sort_order, created_at,
                       content, video_url, participant_count, tags, stage_count
                FROM   vding_learning_content
                WHERE  is_active = TRUE
                ORDER  BY sort_order, created_at DESC
                """
            )
        return [LearningContentEntity.from_record(dict(r)) for r in rows]

    async def get_learning_content_by_id(self, content_id: str) -> Optional[LearningContentEntity]:
        """학습 콘텐츠 상세 조회"""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, title, description, category, thumbnail_url,
                       author, duration_min, sort_order, created_at,
                       content, video_url, participant_count, tags, stage_count
                FROM   vding_learning_content
                WHERE  id = $1 AND is_active = TRUE
                """,
                content_id,
            )
        if not row:
            return None
        return LearningContentEntity.from_record(dict(row))

    # ── 학습 진행 상태 관리 ────────────────────────────────────────

    async def get_learning_progress(
        self, user_id: str, content_id: str
    ) -> Optional[LearningProgressEntity]:
        """학습 진행 상태 조회"""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, user_id, content_id, last_stage_id, last_step_id,
                       completed_stages, completed_steps, progress_pct,
                       created_at, updated_at
                FROM   vding_learning_progress
                WHERE  user_id = $1 AND content_id = $2
                """,
                uuid.UUID(user_id),
                uuid.UUID(content_id),
            )
        if not row:
            return None
        return LearningProgressEntity.from_record(dict(row))

    async def upsert_learning_progress(
        self,
        user_id: str,
        content_id: str,
        stage_id: Optional[str] = None,
        step_id: Optional[str] = None,
        completed: bool = False,
    ) -> LearningProgressEntity:
        """학습 진행 상태 저장/업데이트"""
        async with self._pool.acquire() as conn:
            # 기존 진행 상태 조회
            existing = await self.get_learning_progress(user_id, content_id)
            
            completed_stages = existing.completed_stages if existing else []
            completed_steps = existing.completed_steps if existing else []
            
            # 완료 처리
            if completed and stage_id and stage_id not in completed_stages:
                completed_stages.append(stage_id)
            if completed and step_id and step_id not in completed_steps:
                completed_steps.append(step_id)
            
            row = await conn.fetchrow(
                """
                INSERT INTO vding_learning_progress
                    (user_id, content_id, last_stage_id, last_step_id,
                     completed_stages, completed_steps, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (user_id, content_id) DO UPDATE SET
                    last_stage_id = COALESCE(EXCLUDED.last_stage_id, vding_learning_progress.last_stage_id),
                    last_step_id = COALESCE(EXCLUDED.last_step_id, vding_learning_progress.last_step_id),
                    completed_stages = EXCLUDED.completed_stages,
                    completed_steps = EXCLUDED.completed_steps,
                    updated_at = NOW()
                RETURNING *
                """,
                uuid.UUID(user_id),
                uuid.UUID(content_id),
                stage_id,
                step_id,
                json.dumps(completed_stages),
                json.dumps(completed_steps),
            )
            
            # learning_history 테이블에 동기화 (학습 기록 저장)
            # 학습 콘텐츠 정보 조회
            content_row = await conn.fetchrow(
                """
                SELECT title, category, thumbnail_url, author, duration_min, stage_count
                FROM vding_learning_content
                WHERE id = $1
                """,
                uuid.UUID(content_id),
            )
            
            if content_row:
                # 진행률 계산 (completed_stages와 completed_steps 기반)
                # stage_count를 content에서 가져오거나 기본값 사용
                stage_count = content_row.get("stage_count") or 1
                # 각 stage당 평균 step 수를 가정 (실제로는 content 구조에서 계산해야 함)
                # 임시로 completed_steps 수를 기반으로 진행률 계산
                total_steps_estimate = stage_count * 2  # 각 stage당 평균 2개 step 가정
                # completed_stages와 completed_steps를 모두 고려한 진행률 계산
                stage_progress = (len(completed_stages) / max(stage_count, 1)) * 50  # stage 완료는 50%
                step_progress = (len(completed_steps) / max(total_steps_estimate, 1)) * 50  # step 완료는 50%
                progress_pct = min(100, int(stage_progress + step_progress))
                
                # learning_history에 upsert
                await conn.execute(
                    """
                    INSERT INTO vding_learning_history
                        (user_id, content_id, content_title, content_category, thumbnail_url,
                         author, duration_min, completed, progress_pct, last_accessed)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    ON CONFLICT (user_id, content_id) DO UPDATE SET
                        content_title = EXCLUDED.content_title,
                        content_category = EXCLUDED.content_category,
                        thumbnail_url = EXCLUDED.thumbnail_url,
                        author = EXCLUDED.author,
                        duration_min = EXCLUDED.duration_min,
                        completed = EXCLUDED.completed,
                        progress_pct = EXCLUDED.progress_pct,
                        last_accessed = NOW()
                    """,
                    uuid.UUID(user_id),
                    content_id,
                    content_row["title"],
                    content_row["category"],
                    content_row["thumbnail_url"],
                    content_row["author"],
                    content_row["duration_min"],
                    progress_pct >= 100,  # 완료 여부
                    progress_pct,
                )
            
        return LearningProgressEntity.from_record(dict(row))
