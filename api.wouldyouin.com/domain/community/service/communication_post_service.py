# -*- coding: utf-8 -*-
"""
Communication Post Service
"""

from typing import Any, Dict, List

from domain.community.repository.communication_post_repository import (
    CommunicationPostRepository,
)


class CommunicationPostService:
    def __init__(self, repo: CommunicationPostRepository) -> None:
        self._repo = repo

    async def get_posts(self) -> Dict[str, Any]:
        """소통 게시글 목록 조회 (현재는 스텁)"""
        data: List[Dict[str, Any]] = await self._repo.list_posts()
        return {"message": "소통 게시글 목록", "data": data}

