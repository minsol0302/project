# -*- coding: utf-8 -*-
"""
Company Job Service
"""

from typing import Any, Dict, List

from domain.community.repository.company_job_repository import CompanyJobRepository


class CompanyJobService:
    def __init__(self, repo: CompanyJobRepository) -> None:
        self._repo = repo

    async def get_jobs(self) -> Dict[str, Any]:
        """채용 목록 조회"""
        data: List[Dict[str, Any]] = await self._repo.list_jobs()
        return {"message": "채용 목록", "data": data}

