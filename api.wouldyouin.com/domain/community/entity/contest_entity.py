# -*- coding: utf-8 -*-
"""
Contest Entity
"""

from dataclasses import dataclass
from typing import Any, Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class ContestEntity:
    id: str
    title: str
    host: str
    dday: Optional[int]
    prize: Optional[str]
    tags: Optional[Any]
    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "ContestEntity":
        return cls(
            id=str(rec["id"]),
            title=rec["title"],
            host=rec["host"],
            dday=rec.get("dday"),
            prize=rec.get("prize"),
            tags=rec.get("tags"),
            created_at=_to_iso_str(rec["created_at"]),
        )
