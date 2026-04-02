# -*- coding: utf-8 -*-
"""
Company Job Repository
"""

from typing import Any, Dict, List

import asyncpg


class CompanyJobRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_jobs(self) -> List[Dict[str, Any]]:
        """채용 목록 조회 (vding_community_jobs)"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, title, company, location, job_type, created_at
                FROM   vding_community_jobs
                WHERE  is_active = TRUE
                ORDER  BY sort_order, created_at DESC
                """
            )

        return [
            {
                "id": str(r["id"]),
                "title": r["title"],
                "company": r["company"],
                "location": r["location"],
                "type": r["job_type"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]

