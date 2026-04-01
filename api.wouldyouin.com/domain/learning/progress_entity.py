# -*- coding: utf-8 -*-
"""
Learning Progress Entity
"""
import json
from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class LearningProgressEntity:
    """학습 진행 상태 Entity"""
    id: str
    user_id: str
    content_id: str
    last_stage_id: Optional[str]
    last_step_id: Optional[str]
    completed_stages: List[str]
    completed_steps: List[str]
    progress_pct: int
    created_at: str
    updated_at: str

    @classmethod
    def _ensure_list(cls, val) -> List[str]:
        """Ensure a value is a Python list (handles JSONB string edge case)."""
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                parsed = json.loads(val)
                return parsed if isinstance(parsed, list) else []
            except (json.JSONDecodeError, TypeError):
                return []
        if val is None:
            return []
        return []

    @classmethod
    def from_record(cls, rec: dict) -> "LearningProgressEntity":
        return cls(
            id=str(rec["id"]),
            user_id=str(rec["user_id"]),
            content_id=str(rec["content_id"]),
            last_stage_id=rec.get("last_stage_id"),
            last_step_id=rec.get("last_step_id"),
            completed_stages=cls._ensure_list(rec.get("completed_stages")),
            completed_steps=cls._ensure_list(rec.get("completed_steps")),
            progress_pct=rec.get("progress_pct", 0),
            created_at=rec["created_at"].isoformat() if hasattr(rec["created_at"], "isoformat") else str(rec["created_at"]),
            updated_at=rec["updated_at"].isoformat() if hasattr(rec["updated_at"], "isoformat") else str(rec["updated_at"]),
        )
