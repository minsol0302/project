# -*- coding: utf-8 -*-
"""
Study Group Member DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateStudyGroupMemberRequestDTO:
    group_id: str

    user_id: Optional[str] = None
    nickname: str = ""

    role: str = "MEMBER"
    member_status: str = "ACTIVE"


@dataclass
class StudyGroupMemberResponseDTO:
    member_id: str
    group_id: str

    user_id: Optional[str]
    nickname: str

    role: str
    member_status: str

    joined_at: str

