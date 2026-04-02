# -*- coding: utf-8 -*-
"""
Contest Repository
"""

import json
from typing import Any, Dict, List

import asyncpg


class ContestRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_contests(self) -> List[Dict[str, Any]]:
        """공모전 목록 조회 (vding_community_contests)"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, title, host, dday, prize, tags, created_at
                FROM   vding_community_contests
                WHERE  is_active = TRUE
                ORDER  BY sort_order, created_at DESC
                """
            )

        result: List[Dict[str, Any]] = []
        for r in rows:
            tags_val = r["tags"]
            tags = json.loads(tags_val) if isinstance(tags_val, str) else tags_val
            result.append(
                {
                    "id": str(r["id"]),
                    "title": r["title"],
                    "host": r["host"],
                    "dday": r["dday"],
                    "prize": r["prize"],
                    "tags": tags,
                    "created_at": r["created_at"].isoformat(),
                }
            )
        return result

