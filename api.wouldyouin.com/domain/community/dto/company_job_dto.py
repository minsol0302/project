# -*- coding: utf-8 -*-
"""
Company Job DTOs
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateCompanyJobRequestDTO:
    company_name: str
    title: str
    job_category: str
    summary: Optional[str] = None

    location: Optional[str] = None
    work_model: Optional[str] = None
    employment_type: Optional[str] = None

    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_unit: str = "KRW"
    salary_note: Optional[str] = None

    apply_start_date: Optional[str] = None
    apply_end_date: Optional[str] = None
    dday: Optional[int] = None
    status: str = "OPEN"

    posted_by_user_id: Optional[str] = None

    tags: Optional[str] = None
    description: Optional[str] = None
    apply_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    is_featured: bool = False
    sort_order: int = 0


@dataclass
class CompanyJobResponseDTO:
    job_id: str

    company_name: str
    title: str
    job_category: str
    summary: Optional[str]

    location: Optional[str]
    work_model: Optional[str]
    employment_type: Optional[str]

    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_unit: str
    salary_note: Optional[str]

    apply_start_date: Optional[str]
    apply_end_date: Optional[str]
    dday: Optional[int]
    status: str

    posted_by_user_id: Optional[str]

    tags: Optional[str]
    description: Optional[str]
    apply_url: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]

    is_featured: bool
    sort_order: int

    created_at: str
    updated_at: str

