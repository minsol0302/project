# -*- coding: utf-8 -*-
"""
Board Post Repository
"""

from typing import Any, Dict, List

import asyncpg


class BoardPostRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_board_posts(self) -> List[Dict[str, Any]]:
        """게시판 글 목록 조회 (vding_community_board_posts)"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, author_name, title, content, replies, created_at
                FROM   vding_community_board_posts
                WHERE  is_active = TRUE
                ORDER  BY created_at DESC
                """
            )

        return [
            {
                "id": str(r["id"]),
                "author": r["author_name"],
                "title": r["title"],
                "content": r["content"],
                "replies": r["replies"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]

