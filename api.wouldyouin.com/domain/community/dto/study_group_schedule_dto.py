# -*- coding: utf-8 -*-
"""
Study Group Schedule DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateStudyGroupScheduleRequestDTO:
    group_id: str

    specific_date: Optional[str] = None
    weekday: Optional[int] = None

    start_time: Optional[str] = None
    end_time: Optional[str] = None

    timezone: str = "Asia/Seoul"
    place: Optional[str] = None


@dataclass
class StudyGroupScheduleResponseDTO:
    schedule_id: str
    group_id: str

    specific_date: Optional[str]
    weekday: Optional[int]

    start_time: Optional[str]
    end_time: Optional[str]

    timezone: str
    place: Optional[str]

    created_at: str

