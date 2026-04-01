# -*- coding: utf-8 -*-
"""
Social Entities
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass(frozen=True)
class FollowEntity:
    """팔로우 관계 Entity"""
    follower_id: str
    following_id: str


@dataclass(frozen=True)
class LikeEntity:
    """좋아요 Entity"""
    user_id: str
    post_id: str


@dataclass(frozen=True)
class NotificationEntity:
    """알림 Entity"""
    id: str
    user_id: str
    type: str
    message: str
    is_read: bool
    created_at: str
    post_id: Optional[str]
    actor_id: Optional[str]
    actor_username: Optional[str]
    actor_avatar: Optional[str]

    @classmethod
    def from_record(cls, rec: dict) -> "NotificationEntity":
        return cls(
            id=str(rec["id"]),
            user_id=str(rec.get("user_id", "")),
            type=rec["type"],
            message=rec["message"],
            is_read=rec["is_read"],
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
            post_id=str(rec["post_id"]) if rec.get("post_id") else None,
            actor_id=str(rec.get("actor_id", "")) if rec.get("actor_id") else None,
            actor_username=rec.get("actor_username"),
            actor_avatar=rec.get("actor_avatar"),
        )


@dataclass(frozen=True)
class StoryEntity:
    """스토리 Entity"""
    id: str
    user_id: str
    username: str
    name: Optional[str]
    avatar_url: Optional[str]
    image_urls: List[str]
    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "StoryEntity":
        image_urls = rec.get("image_urls", [])
        if isinstance(image_urls, str):
            import json
            try:
                image_urls = json.loads(image_urls)
            except:
                image_urls = []
        return cls(
            id=str(rec["post_id"]),
            user_id=str(rec["uid"]),
            username=rec["username"],
            name=rec.get("name"),
            avatar_url=rec.get("avatar_url"),
            image_urls=image_urls if isinstance(image_urls, list) else [],
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
        )
