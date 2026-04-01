# -*- coding: utf-8 -*-
"""
Learning DTOs
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class LearningContentDTO:
    id: str
    title: str
    description: str
    category: str
    thumbnail_url: Optional[str]
    author: str
    duration_min: int
    created_at: str
    content: Optional[str] = None  # 블로그 본문
    video_url: Optional[str] = None  # 동영상 링크
    participant_count: Optional[int] = 0
    tags: Optional[List[str]] = None
    stage_count: Optional[int] = 0


@dataclass
class LearningListResponseDTO:
    message: str
    data: List[LearningContentDTO]
