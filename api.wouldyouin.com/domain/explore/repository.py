# -*- coding: utf-8 -*-
"""
Explore Repository
"""
from typing import List
import asyncpg

from domain.explore.entity import ExploreItemEntity, ExplorePostEntity


class ExploreRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def get_explore_items(self) -> List[ExploreItemEntity]:
        """탐색 아이템 목록 조회"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, item_type, title, category, description, color
                FROM   vding_explore_items
                WHERE  is_active = TRUE
                ORDER  BY sort_order
                """
            )
        return [ExploreItemEntity.from_record(dict(r)) for r in rows]

    async def search_items(self, keyword: str) -> List[ExploreItemEntity]:
        """아이템 검색"""
        if not keyword.strip():
            return await self.get_explore_items()
        
        kw = f"%{keyword.strip().lower()}%"
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, item_type, title, category, description, color
                FROM   vding_explore_items
                WHERE  is_active = TRUE
                  AND  (LOWER(title) LIKE $1
                        OR LOWER(description) LIKE $1
                        OR LOWER(category) LIKE $1)
                ORDER  BY sort_order
                """,
                kw,
            )
        return [ExploreItemEntity.from_record(dict(r)) for r in rows]

    async def search_posts(self, keyword: str) -> List[ExplorePostEntity]:
        """게시물 검색 (해시태그 기반)"""
        if not keyword.strip():
            return []
        
        kw = keyword.strip()
        hashtag_q = kw if kw.startswith("#") else f"#{kw}"
        search_kw = f"%{kw.lower()}%"
        
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT p.id, p.thumbnail_url, p.image_urls, p.caption, p.hashtags, p.created_at,
                       u.username, u.avatar_url
                FROM   vding_posts p
                JOIN   vding_users u ON u.id = p.user_id
                WHERE  p.type = 'feed'
                  AND  (p.expires_at IS NULL OR p.expires_at > NOW())
                  AND  (
                    $1 = ANY(p.hashtags)
                    OR LOWER(p.caption) LIKE $2
                    OR EXISTS (SELECT 1 FROM unnest(p.hashtags) AS h WHERE LOWER(h) LIKE $2)
                  )
                ORDER  BY p.created_at DESC
                LIMIT  20
                """,
                hashtag_q, search_kw,
            )
        return [ExplorePostEntity.from_record(dict(r)) for r in rows]
