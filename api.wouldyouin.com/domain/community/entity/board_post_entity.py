# -*- coding: utf-8 -*-
"""
Board Post Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class BoardPostEntity:
    post_id: str
    board_id: str

    post_type: Optional[str]

    title: str
    content: str

    author_user_id: Optional[str]
    author_name: Optional[str]

    status: str
    is_notice: bool
    is_pinned: bool

    view_count: int
    like_count: int
    sort_order: int

    parent_post_id: Optional[str]

    created_at: str
    updated_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "BoardPostEntity":
        return cls(
            post_id=str(rec["post_id"]),
            board_id=str(rec["board_id"]),
            post_type=rec.get("post_type"),
            title=rec["title"],
            content=rec["content"],
            author_user_id=str(rec["author_user_id"]) if rec.get("author_user_id") is not None else None,
            author_name=rec.get("author_name"),
            status=rec["status"],
            is_notice=bool(rec["is_notice"]),
            is_pinned=bool(rec["is_pinned"]),
            view_count=int(rec.get("view_count", 0)),
            like_count=int(rec.get("like_count", 0)),
            sort_order=int(rec.get("sort_order", 0)),
            parent_post_id=str(rec["parent_post_id"]) if rec.get("parent_post_id") is not None else None,
            created_at=_to_iso_str(rec["created_at"]),
            updated_at=_to_iso_str(rec["updated_at"]),
        )

