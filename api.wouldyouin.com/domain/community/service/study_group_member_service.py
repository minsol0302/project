# -*- coding: utf-8 -*-
"""
Study Group Member Service
"""

from typing import Any, Dict, List

from domain.community.repository.study_group_member_repository import StudyGroupMemberRepository


class StudyGroupMemberService:
    def __init__(self, repo: StudyGroupMemberRepository) -> None:
        self._repo = repo

    async def get_members(self, group_id: str) -> Dict[str, Any]:
        """스터디 모임 멤버 목록 조회 (현재는 스텁)"""
        data: List[Dict[str, Any]] = await self._repo.list_members(group_id)
        return {"message": "스터디 멤버 목록", "data": data}

