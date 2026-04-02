# -*- coding: utf-8 -*-
"""
Study Group Repository
"""

from typing import Any, Dict, List

import asyncpg


class StudyGroupRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_study_groups(self) -> List[Dict[str, Any]]:
        """스터디 모임 목록 조회 (vding_community_study_groups)"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, name, schedule, location,
                       max_members, current_members, tag, created_at
                FROM   vding_community_study_groups
                WHERE  is_active = TRUE
                ORDER  BY sort_order, created_at DESC
                """
            )

        return [
            {
                "id": str(r["id"]),
                "name": r["name"],
                "day": r["schedule"],
                "location": r["location"],
                "members": f"{r['current_members']}/{r['max_members']}명",
                "tag": r["tag"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]

