# -*- coding: utf-8 -*-
"""
Study Group Service
"""

from typing import Any, Dict, List

from domain.community.repository.study_group_repository import StudyGroupRepository


class StudyGroupService:
    def __init__(self, repo: StudyGroupRepository) -> None:
        self._repo = repo

    async def get_study_groups(self) -> Dict[str, Any]:
        """스터디 모임 목록 조회"""
        data: List[Dict[str, Any]] = await self._repo.list_study_groups()
        return {"message": "스터디 모임 목록", "data": data}

