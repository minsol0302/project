# -*- coding: utf-8 -*-
import json
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_contests():
    """공모전 목록 조회 (Neon DB)"""
    from core.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, title, host, dday, prize, tags, created_at
            FROM   vding_community_contests
            WHERE  is_active = TRUE
            ORDER  BY sort_order, created_at DESC
            """
        )

    data = [
        {
            "id": str(r["id"]),
            "title": r["title"],
            "host": r["host"],
            "dday": r["dday"],
            "prize": r["prize"],
            "tags": json.loads(r["tags"]) if isinstance(r["tags"], str) else r["tags"],
            "created_at": r["created_at"].isoformat(),
        }
        for r in rows
    ]
    return {"message": "공모전 목록", "data": data}
