# -*- coding: utf-8 -*-
"""
Explore Entities
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass(frozen=True)
class ExploreItemEntity:
    """탐색 아이템 Entity"""
    id: str
    item_type: str
    title: str
    category: str
    description: str
    color: Optional[str]

    @classmethod
    def from_record(cls, rec: dict) -> "ExploreItemEntity":
        return cls(
            id=str(rec["id"]),
            item_type=rec["item_type"],
            title=rec["title"],
            category=rec["category"],
            description=rec["description"],
            color=rec.get("color"),
        )


@dataclass(frozen=True)
class ExplorePostEntity:
    """탐색 게시물 Entity"""
    id: str
    thumbnail_url: Optional[str]
    image_urls: List[str]
    caption: Optional[str]
    hashtags: List[str]
    created_at: str
    username: str
    avatar_url: Optional[str]

    @classmethod
    def from_record(cls, rec: dict) -> "ExplorePostEntity":
        hashtags = rec.get("hashtags", [])
        if not isinstance(hashtags, list):
            hashtags = []
        image_urls = rec.get("image_urls", [])
        if not isinstance(image_urls, list):
            image_urls = []
        return cls(
            id=str(rec["id"]),
            thumbnail_url=rec.get("thumbnail_url"),
            image_urls=image_urls,
            caption=rec.get("caption"),
            hashtags=hashtags,
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
            username=rec["username"],
            avatar_url=rec.get("avatar_url"),
        )
