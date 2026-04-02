# -*- coding: utf-8 -*-
"""
Communication Post Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class CommunicationPostEntity:
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

    @classmethod
    def from_record(cls, rec: dict) -> "CommunicationPostEntity":
        return cls(
            post_id=str(rec["post_id"]),
            post_type=rec["post_type"],
            topic=rec.get("topic"),
            title=rec["title"],
            content=rec["content"],
            author_user_id=str(rec["author_user_id"]) if rec.get("author_user_id") is not None else None,
            author_name=rec.get("author_name"),
            status=rec["status"],
            is_pinned=bool(rec["is_pinned"]),
            is_featured=bool(rec["is_featured"]),
            view_count=int(rec.get("view_count", 0)),
            like_count=int(rec.get("like_count", 0)),
            created_at=_to_iso_str(rec["created_at"]),
            updated_at=_to_iso_str(rec["updated_at"]),
        )

