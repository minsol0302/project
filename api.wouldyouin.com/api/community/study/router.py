# -*- coding: utf-8 -*-
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_study_groups():
    """스터디 모임 목록 조회 (Neon DB)"""
    from core.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, name, schedule, location,
                   max_members, current_members, tag, created_at
            FROM   vding_community_study_groups
            WHERE  is_active = TRUE
            ORDER  BY sort_order, created_at DESC
            """
        )

    data = [
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
    return {"message": "스터디 모임 목록", "data": data}
