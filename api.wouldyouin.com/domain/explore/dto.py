# -*- coding: utf-8 -*-
"""
Explore DTOs
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ExploreItemDTO:
    id: str
    type: str
    title: str
    category: str
    desc: str
    color: Optional[str]
    result_type: Optional[str] = None


@dataclass
class ExploreListResponseDTO:
    data: List[ExploreItemDTO]


@dataclass
class ExplorePostDTO:
    id: str
    type: str
    title: str
    thumbnail_url: Optional[str]
    hashtags: List[str]
    username: str
    avatar_url: Optional[str]
    created_at: str
    result_type: str


@dataclass
class ExploreSearchResponseDTO:
    q: str
    count: int
    data: List  # List[Union[ExploreItemDTO, ExplorePostDTO]]
