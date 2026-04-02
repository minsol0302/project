# -*- coding: utf-8 -*-
"""
Study Group Member Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class StudyGroupMemberEntity:
    member_id: str
    group_id: str

    user_id: Optional[str]
    nickname: str

    role: str
    member_status: str

    joined_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "StudyGroupMemberEntity":
        return cls(
            member_id=str(rec["member_id"]),
            group_id=str(rec["group_id"]),
            user_id=str(rec["user_id"]) if rec.get("user_id") is not None else None,
            nickname=rec["nickname"],
            role=rec["role"],
            member_status=rec["member_status"],
            joined_at=_to_iso_str(rec["joined_at"]),
        )

