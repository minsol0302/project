# -*- coding: utf-8 -*-
"""
Contest Service
"""

from typing import Any, Dict, List

from domain.community.repository.contest_repository import ContestRepository


class ContestService:
    def __init__(self, repo: ContestRepository) -> None:
        self._repo = repo

    async def get_contests(self) -> Dict[str, Any]:
        """공모전 목록 조회"""
        data: List[Dict[str, Any]] = await self._repo.list_contests()
        return {"message": "공모전 목록", "data": data}

