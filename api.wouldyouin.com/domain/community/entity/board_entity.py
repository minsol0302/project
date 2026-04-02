# -*- coding: utf-8 -*-
"""
Board Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class BoardEntity:
    board_id: str
    board_key: str
    board_name: str
    board_description: Optional[str]

    is_public: bool
    is_locked: bool

    sort_order: int

    created_at: str
    updated_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "BoardEntity":
        return cls(
            board_id=str(rec["board_id"]),
            board_key=rec["board_key"],
            board_name=rec["board_name"],
            board_description=rec.get("board_description"),
            is_public=bool(rec["is_public"]),
            is_locked=bool(rec["is_locked"]),
            sort_order=int(rec["sort_order"]),
            created_at=_to_iso_str(rec["created_at"]),
            updated_at=_to_iso_str(rec["updated_at"]),
        )

