# -*- coding: utf-8 -*-
"""
Study Group Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class StudyGroupEntity:
    group_id: str

    title: str
    organizer_name: Optional[str]
    organizer_user_id: Optional[str]

    description: Optional[str]
    category: Optional[str]
    location: Optional[str]
    meeting_type: Optional[str]

    recruitment_start_date: Optional[str]
    recruitment_end_date: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]

    capacity: int
    status: str

    is_featured: bool
    sort_order: int

    created_at: str
    updated_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "StudyGroupEntity":
        return cls(
            group_id=str(rec["group_id"]),
            title=rec["title"],
            organizer_name=rec.get("organizer_name"),
            organizer_user_id=str(rec["organizer_user_id"]) if rec.get("organizer_user_id") is not None else None,
            description=rec.get("description"),
            category=rec.get("category"),
            location=rec.get("location"),
            meeting_type=rec.get("meeting_type"),
            recruitment_start_date=_to_iso_str(rec.get("recruitment_start_date")),
            recruitment_end_date=_to_iso_str(rec.get("recruitment_end_date")),
            start_date=_to_iso_str(rec.get("start_date")),
            end_date=_to_iso_str(rec.get("end_date")),
            capacity=int(rec.get("capacity", 0)),
            status=rec["status"],
            is_featured=bool(rec["is_featured"]),
            sort_order=int(rec.get("sort_order", 0)),
            created_at=_to_iso_str(rec["created_at"]),
            updated_at=_to_iso_str(rec["updated_at"]),
        )

