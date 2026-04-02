# -*- coding: utf-8 -*-
"""
Communication Post Repository (stub)
"""

from typing import Any, Dict, List

import asyncpg


class CommunicationPostRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_posts(self) -> List[Dict[str, Any]]:
        """소통(커뮤니케이션) 게시글 목록 조회.

        현재 프로젝트에서 communication 전용 라우터/테이블 사용 로직을 확인하지 못해
        스텁으로 둡니다.
        """
        raise NotImplementedError("list_posts is not implemented yet")

