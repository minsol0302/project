# -*- coding: utf-8 -*-
"""
Board Post Service
"""

from typing import Any, Dict, List

from domain.community.repository.board_post_repository import BoardPostRepository


class BoardPostService:
    def __init__(self, repo: BoardPostRepository) -> None:
        self._repo = repo

    async def get_board_posts(self) -> Dict[str, Any]:
        """게시판 글 목록 조회"""
        data: List[Dict[str, Any]] = await self._repo.list_board_posts()
        return {"message": "게시판 글 목록", "data": data}

