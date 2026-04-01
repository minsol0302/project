# -*- coding: utf-8 -*-
"""
Drafts DTOs
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class DraftSaveRequestDTO:
    draft_id: Optional[str] = None
    caption: str = ""
    location: str = ""
    hashtags: List[str] = None
    thumbnail_idx: int = 0

    def __post_init__(self):
        if self.hashtags is None:
            self.hashtags = []


@dataclass
class DraftResponseDTO:
    id: str
    caption: str
    location: str
    hashtags: List[str]
    thumbnail_idx: int
    updated_at: str
    created_at: str


@dataclass
class DraftListResponseDTO:
    drafts: List[DraftResponseDTO]
    count: int


@dataclass
class DraftSaveResponseDTO:
    success: bool
    draft_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
