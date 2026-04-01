# -*- coding: utf-8 -*-
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_connect():
    """기업 소통 채널 목록 조회 (Neon DB)"""
    from core.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, name, description, followers, category, created_at
            FROM   vding_community_channels
            WHERE  is_active = TRUE
            ORDER  BY sort_order, created_at DESC
            """
        )

    data = [
        {
            "id": str(r["id"]),
            "name": r["name"],
            "desc": r["description"],
            "followers": f"{r['followers']:,}",
            "category": r["category"],
            "created_at": r["created_at"].isoformat(),
        }
        for r in rows
    ]
    return {"message": "기업 소통 채널 목록", "data": data}
