# -*- coding: utf-8 -*-
"""
Board Repository (stub)
"""

from typing import Any, Dict, List

import asyncpg


class BoardRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_boards(self) -> List[Dict[str, Any]]:
        """
        게시판(카테고리/채널) 목록 조회.
        현재 프로젝트에는 board 카테고리 전용 라우터/테이블 사용 로직이 없어 스텁으로 둡니다.
        """
        raise NotImplementedError("list_boards is not implemented yet")

