# -*- coding: utf-8 -*-
"""
Communication Comment Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class CommunicationCommentEntity:
    comment_id: str

    post_id: str
    parent_comment_id: Optional[str]

    author_user_id: Optional[str]
    author_name: Optional[str]

    content: str

    status: str
    like_count: int

    created_at: str
    updated_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "CommunicationCommentEntity":
        return cls(
            comment_id=str(rec["comment_id"]),
            post_id=str(rec["post_id"]),
            parent_comment_id=str(rec["parent_comment_id"]) if rec.get("parent_comment_id") is not None else None,
            author_user_id=str(rec["author_user_id"]) if rec.get("author_user_id") is not None else None,
            author_name=rec.get("author_name"),
            content=rec["content"],
            status=rec["status"],
            like_count=int(rec.get("like_count", 0)),
            created_at=_to_iso_str(rec["created_at"]),
            updated_at=_to_iso_str(rec["updated_at"]),
        )

