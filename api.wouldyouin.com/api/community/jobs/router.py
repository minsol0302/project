# -*- coding: utf-8 -*-
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_jobs():
    """채용 목록 조회 (Neon DB)"""
    from core.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, title, company, location, job_type, created_at
            FROM   vding_community_jobs
            WHERE  is_active = TRUE
            ORDER  BY sort_order, created_at DESC
            """
        )

    data = [
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
    return {"message": "채용 목록", "data": data}
