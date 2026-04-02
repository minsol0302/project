# -*- coding: utf-8 -*-
"""
Study Group Member Repository (stub)
"""

from typing import Any, Dict, List

import asyncpg


class StudyGroupMemberRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_members(self, group_id: str) -> List[Dict[str, Any]]:
        """스터디 모임 멤버 목록 조회.
        현재 프로젝트에 멤버 전용 테이블/라우터 구현이 없어 스텁으로 둡니다.
        """
        raise NotImplementedError("list_members is not implemented yet")

