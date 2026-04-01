# -*- coding: utf-8 -*-
"""
Drafts Entities
"""
from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class DraftEntity:
    """임시저장 Entity"""
    id: str
    caption: str
    location: str
    hashtags: List[str]
    thumbnail_idx: int
    updated_at: str
    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "DraftEntity":
        hashtags = rec.get("hashtags", [])
        if not isinstance(hashtags, list):
            hashtags = []
        return cls(
            id=str(rec["id"]),
            caption=rec.get("caption", "") or "",
            location=rec.get("location", "") or "",
            hashtags=hashtags,
            thumbnail_idx=rec.get("thumbnail_idx", 0) or 0,
            updated_at=rec["updated_at"].isoformat() if hasattr(rec["updated_at"], "isoformat") else str(rec["updated_at"]),
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
        )
