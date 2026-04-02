# -*- coding: utf-8 -*-
"""
Communication Comment DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateCommunicationCommentRequestDTO:
    post_id: str
    parent_comment_id: Optional[str] = None

    author_user_id: Optional[str] = None
    author_name: Optional[str] = None

    content: str = ""
    status: str = "OPEN"


@dataclass
class CommunicationCommentResponseDTO:
    comment_id: str

    post_id: str
    parent_comment_id: Optional[str]

    author_user_id: Optional[str]
    author_name: Optional[str]

    content: str
    status: str
    like_count: int

    created_at: str
    updated_at: str

