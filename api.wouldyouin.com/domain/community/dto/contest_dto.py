# -*- coding: utf-8 -*-
"""
Contest DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateContestRequestDTO:
    title: str
    organizer_name: str
    organizer_user_id: Optional[str] = None

    category: str = ""
    summary: Optional[str] = None

    start_date: str = ""
    end_date: str = ""
    dday: Optional[int] = None
    status: str = "OPEN"

    prize_summary: Optional[str] = None
    prize_amount: Optional[int] = None
    tags: Optional[str] = None

    is_featured: bool = False
    sort_order: int = 0


@dataclass
class ContestResponseDTO:
    contest_id: str

    title: str
    organizer_name: str
    organizer_user_id: Optional[str]

    category: str
    summary: Optional[str]

    start_date: str
    end_date: str
    dday: Optional[int]
    status: str

    prize_summary: Optional[str]
    prize_amount: Optional[int]
    tags: Optional[str]

    is_featured: bool
    sort_order: int

    created_at: str
    updated_at: str

