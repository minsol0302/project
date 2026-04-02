# -*- coding: utf-8 -*-
"""
Communication Comment Repository (stub)
"""

from typing import Any, Dict, List

import asyncpg


class CommunicationCommentRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_comments(self, post_id: str) -> List[Dict[str, Any]]:
        """소통(커뮤니케이션) 댓글 목록 조회.
        현재 프로젝트에서 communication_comment 전용 테이블/라우터 구현을 확인하지 못해 스텁으로 둡니다.
        """
        raise NotImplementedError("list_comments is not implemented yet")

