# -*- coding: utf-8 -*-
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_board():
    """게시판 글 목록 조회 (Neon DB)"""
    from core.database import get_pool

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, author_name, title, content, replies, created_at
            FROM   vding_community_board_posts
            WHERE  is_active = TRUE
            ORDER  BY created_at DESC
            """
        )

    data = [
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
    return {"message": "게시판 글 목록", "data": data}
