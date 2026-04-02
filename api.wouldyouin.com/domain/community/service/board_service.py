# -*- coding: utf-8 -*-
"""
Board Service
"""

from typing import Any, Dict, List

from domain.community.repository.board_repository import BoardRepository


class BoardService:
    def __init__(self, repo: BoardRepository) -> None:
        self._repo = repo

    async def get_boards(self) -> Dict[str, Any]:
        """게시판 목록 조회 (현재는 스텁)"""
        data: List[Dict[str, Any]] = await self._repo.list_boards()
        return {"message": "게시판 목록", "data": data}

