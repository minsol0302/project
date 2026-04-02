# -*- coding: utf-8 -*-
"""
Study Group Schedule Repository (stub)
"""

from typing import Any, Dict, List

import asyncpg


class StudyGroupScheduleRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def list_schedules(self, group_id: str) -> List[Dict[str, Any]]:
        """스터디 스케줄 목록 조회.
        현재 프로젝트에 schedule 전용 테이블/라우터 로직이 없어 스텁으로 둡니다.
        """
        raise NotImplementedError("list_schedules is not implemented yet")

