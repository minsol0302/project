# -*- coding: utf-8 -*-
"""
Drafts Repository
"""
from typing import Optional, List
import asyncpg
import uuid

from domain.drafts.entity import DraftEntity


class DraftsRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def save_draft(
        self,
        user_id: str,
        draft_id: Optional[str],
        caption: str,
        location: str,
        hashtags: List[str],
        thumbnail_idx: int,
    ) -> DraftEntity:
        """임시저장 (upsert)"""
        async with self._pool.acquire() as conn:
            if draft_id:
                # Update existing draft
                row = await conn.fetchrow(
                    """
                    UPDATE vding_drafts
                    SET    caption = $1,
                           location = $2,
                           hashtags = $3,
                           thumbnail_idx = $4,
                           updated_at = NOW()
                    WHERE  id = $5 AND user_id = $6
                    RETURNING id, caption, location, hashtags, thumbnail_idx, updated_at, created_at
                    """,
                    caption,
                    location,
                    hashtags,
                    thumbnail_idx,
                    uuid.UUID(draft_id),
                    uuid.UUID(user_id),
                )
                if not row:
                    raise ValueError("Draft not found")
            else:
                # Create new draft
                row = await conn.fetchrow(
                    """
                    INSERT INTO vding_drafts (user_id, caption, location, hashtags, thumbnail_idx)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, caption, location, hashtags, thumbnail_idx, created_at, updated_at
                    """,
                    uuid.UUID(user_id),
                    caption,
                    location,
                    hashtags,
                    thumbnail_idx,
                )
        return DraftEntity.from_record(dict(row))

    async def list_drafts(self, user_id: str) -> List[DraftEntity]:
        """임시저장 목록 조회"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, caption, location, hashtags, thumbnail_idx, updated_at, created_at
                FROM   vding_drafts
                WHERE  user_id = $1
                ORDER  BY updated_at DESC
                """,
                uuid.UUID(user_id),
            )
        return [DraftEntity.from_record(dict(r)) for r in rows]

    async def get_draft(self, draft_id: str, user_id: str) -> Optional[DraftEntity]:
        """임시저장 상세 조회"""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, caption, location, hashtags, thumbnail_idx, updated_at, created_at
                FROM   vding_drafts
                WHERE  id = $1 AND user_id = $2
                """,
                uuid.UUID(draft_id),
                uuid.UUID(user_id),
            )
        return DraftEntity.from_record(dict(row)) if row else None

    async def delete_draft(self, draft_id: str, user_id: str) -> bool:
        """임시저장 삭제"""
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM vding_drafts WHERE id = $1 AND user_id = $2",
                uuid.UUID(draft_id),
                uuid.UUID(user_id),
            )
        return result != "DELETE 0"
