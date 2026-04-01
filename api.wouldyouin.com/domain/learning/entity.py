# -*- coding: utf-8 -*-
"""
Learning Entities
"""
import json
from dataclasses import dataclass
from typing import Optional, List


@dataclass(frozen=True)
class LearningContentEntity:
    """학습 콘텐츠 Entity"""
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
    participant_count: int = 0  # 참여자 수
    tags: List[str] = None  # 태그 배열
    stage_count: int = 0  # 스테이지 수

    @classmethod
    def _ensure_list(cls, val) -> List[str]:
        """Ensure a value is a Python list (handles JSONB string edge case)."""
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                parsed = json.loads(val)
                return parsed if isinstance(parsed, list) else []
            except (json.JSONDecodeError, TypeError):
                return []
        if val is None:
            return []
        return []

    @classmethod
    def from_record(cls, rec: dict) -> "LearningContentEntity":
        return cls(
            id=str(rec["id"]),
            title=rec["title"],
            description=rec["description"],
            category=rec["category"],
            thumbnail_url=rec.get("thumbnail_url"),
            author=rec["author"],
            duration_min=rec["duration_min"],
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
            content=rec.get("content"),
            video_url=rec.get("video_url"),
            participant_count=rec.get("participant_count", 0),
            tags=cls._ensure_list(rec.get("tags")),
            stage_count=rec.get("stage_count", 0),
        )
