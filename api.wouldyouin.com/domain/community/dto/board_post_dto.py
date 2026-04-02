# -*- coding: utf-8 -*-
"""
Board Post DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateBoardPostRequestDTO:
    board_id: str

    post_type: Optional[str] = None
    title: str = ""
    content: str = ""

    author_user_id: Optional[str] = None
    author_name: Optional[str] = None

    status: str = "OPEN"
    is_notice: bool = False
    is_pinned: bool = False

    sort_order: int = 0
    parent_post_id: Optional[str] = None


@dataclass
class BoardPostResponseDTO:
    post_id: str
    board_id: str

    post_type: Optional[str]
    title: str
    content: str

    author_user_id: Optional[str]
    author_name: Optional[str]

    status: str
    is_notice: bool
    is_pinned: bool

    view_count: int
    like_count: int
    sort_order: int

    parent_post_id: Optional[str]

    created_at: str
    updated_at: str

