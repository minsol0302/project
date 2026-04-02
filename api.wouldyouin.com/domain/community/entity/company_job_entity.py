# -*- coding: utf-8 -*-
"""
Company Job Entity
"""

from dataclasses import dataclass
from typing import Optional


def _to_iso_str(val) -> Optional[str]:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


@dataclass(frozen=True)
class CompanyJobEntity:
    id: str
    title: str
    company: str
    location: Optional[str]
    type: str
    created_at: str

    @classmethod
    def from_record(cls, rec: dict) -> "CompanyJobEntity":
        job_type_val = rec.get("job_type") if "job_type" in rec else rec.get("type")
        return cls(
            id=str(rec["id"]),
            title=rec["title"],
            company=rec["company"],
            location=rec.get("location"),
            type=job_type_val,
            created_at=_to_iso_str(rec["created_at"]),
        )
