# -*- coding: utf-8 -*-
"""
Study Group Schedule Service
"""

from typing import Any, Dict, List

from domain.community.repository.study_group_schedule_repository import (
    StudyGroupScheduleRepository,
)


class StudyGroupScheduleService:
    def __init__(self, repo: StudyGroupScheduleRepository) -> None:
        self._repo = repo

    async def get_schedules(self, group_id: str) -> Dict[str, Any]:
        """스터디 스케줄 목록 조회 (현재는 스텁)"""
        data: List[Dict[str, Any]] = await self._repo.list_schedules(group_id)
        return {"message": "스터디 스케줄 목록", "data": data}

