# -*- coding: utf-8 -*-
"""
Study Group DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateStudyGroupRequestDTO:
    title: str
    organizer_name: Optional[str] = None
    organizer_user_id: Optional[str] = None

    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    meeting_type: Optional[str] = None

    recruitment_start_date: Optional[str] = None
    recruitment_end_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    capacity: int = 0
    status: str = "RECRUITING"

    is_featured: bool = False
    sort_order: int = 0


@dataclass
class StudyGroupResponseDTO:
    group_id: str

    title: str
    organizer_name: Optional[str]
    organizer_user_id: Optional[str]

    description: Optional[str]
    category: Optional[str]
    location: Optional[str]
    meeting_type: Optional[str]

    recruitment_start_date: Optional[str]
    recruitment_end_date: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]

    capacity: int
    status: str

    is_featured: bool
    sort_order: int

    created_at: str
    updated_at: str

