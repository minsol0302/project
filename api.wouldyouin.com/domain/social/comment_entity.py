# -*- coding: utf-8 -*-
"""
Comment Entity
"""
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class CommentEntity:
    id: str
    post_id: str
    user_id: str
    username: str
    text: str
    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "CommentEntity":
        """DB 레코드에서 Entity 생성"""
        return cls(
            id=str(rec["id"]),
            post_id=str(rec["post_id"]),
            user_id=str(rec["user_id"]),
            username=rec["username"],
            text=rec["text"],
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
        )
