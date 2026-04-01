# -*- coding: utf-8 -*-
"""
Explore API Router
라우터 레이어: 요청/응답 처리만 담당
비즈니스 로직: domain.explore.service에서 처리
"""
import logging
from fastapi import APIRouter, Query

from core.database import get_pool
from domain.explore.repository import ExploreRepository
from domain.explore.service import ExploreService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_explore():
    """전체 아이템 목록 (Neon DB)"""
    pool = await get_pool()
    repo = ExploreRepository(pool)
    service = ExploreService(repo)
    
    result = await service.get_explore_list()
    return {"data": [
        {
            "id": item.id,
            "type": item.type,
            "title": item.title,
            "category": item.category,
            "desc": item.desc,
            "color": item.color,
        }
        for item in result.data
    ]}


@router.get("/search")
async def search_explore(q: str = Query(default="", description="검색 키워드")):
    """키워드 기반 프로젝트 + 해시태그 게시물 검색 (Neon DB)"""
    logger.info("[Explore] search q=%s", q)
    
    pool = await get_pool()
    repo = ExploreRepository(pool)
    service = ExploreService(repo)
    
    result = await service.search(q)
    return {
        "q": result.q,
        "count": result.count,
        "data": [
            {
                "id": item.id,
                "type": item.type,
                "title": item.title,
                "category": item.category,
                "desc": item.desc,
                "color": item.color,
                "result_type": item.result_type,
            }
            if hasattr(item, "category") else
            {
                "id": item.id,
                "type": item.type,
                "title": item.title,
                "thumbnail_url": item.thumbnail_url,
                "hashtags": item.hashtags,
                "username": item.username,
                "avatar_url": item.avatar_url,
                "created_at": item.created_at,
                "result_type": item.result_type,
            }
            for item in result.data
        ],
    }
