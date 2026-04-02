# -*- coding: utf-8 -*-
"""
Study Group Schedule Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class StudyGroupScheduleEntity:
    schedule_id: str
    group_id: str

    specific_date: Optional[str]
    weekday: Optional[int]
    start_time: Optional[str]
    end_time: Optional[str]

    timezone: str
    place: Optional[str]

    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "StudyGroupScheduleEntity":
        return cls(
            schedule_id=str(rec["schedule_id"]),
            group_id=str(rec["group_id"]),
            specific_date=_to_iso_str(rec.get("specific_date")),
            weekday=rec.get("weekday"),
            start_time=_to_iso_str(rec.get("start_time")),
            end_time=_to_iso_str(rec.get("end_time")),
            timezone=rec["timezone"],
            place=rec.get("place"),
            created_at=_to_iso_str(rec["created_at"]),
        )

