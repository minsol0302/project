# -*- coding: utf-8 -*-
"""
Communication Comment Service
"""

from typing import Any, Dict, List

from domain.community.repository.communication_comment_repository import (
    CommunicationCommentRepository,
)


class CommunicationCommentService:
    def __init__(self, repo: CommunicationCommentRepository) -> None:
        self._repo = repo

    async def get_comments(self, post_id: str) -> Dict[str, Any]:
        """소통 댓글 목록 조회 (현재는 스텁)"""
        data: List[Dict[str, Any]] = await self._repo.list_comments(post_id)
        return {"message": "소통 댓글 목록", "data": data}

