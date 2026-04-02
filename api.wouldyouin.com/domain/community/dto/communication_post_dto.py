# -*- coding: utf-8 -*-
"""
Communication Post DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateCommunicationPostRequestDTO:
    post_type: str = "GENERAL"
    topic: Optional[str] = None

    title: str = ""
    content: str = ""

    author_user_id: Optional[str] = None
    author_name: Optional[str] = None

    status: str = "OPEN"
    is_pinned: bool = False
    is_featured: bool = False


@dataclass
class CommunicationPostResponseDTO:
    post_id: str

    post_type: str
    topic: Optional[str]

    title: str
    content: str

    author_user_id: Optional[str]
    author_name: Optional[str]

    status: str
    is_pinned: bool
    is_featured: bool

    view_count: int
    like_count: int

    created_at: str
    updated_at: str

