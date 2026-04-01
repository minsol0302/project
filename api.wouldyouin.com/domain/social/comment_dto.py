# -*- coding: utf-8 -*-
"""
Comment DTOs
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateCommentRequestDTO:
    post_id: str
    text: str


@dataclass
class CommentResponseDTO:
    id: str
    post_id: str
    user_id: str
    username: str
    text: str
    created_at: str
