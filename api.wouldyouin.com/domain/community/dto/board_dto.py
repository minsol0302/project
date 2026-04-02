# -*- coding: utf-8 -*-
"""
Board DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateBoardRequestDTO:
    board_key: str
    board_name: str
    board_description: Optional[str] = None

    is_public: bool = True
    is_locked: bool = False
    sort_order: int = 0


@dataclass
class BoardResponseDTO:
    board_id: str
    board_key: str
    board_name: str
    board_description: Optional[str]

    is_public: bool
    is_locked: bool
    sort_order: int

    created_at: str
    updated_at: str

