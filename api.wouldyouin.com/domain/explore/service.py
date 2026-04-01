# -*- coding: utf-8 -*-
"""
Explore Service
"""
from domain.explore.dto import (
    ExploreListResponseDTO,
    ExploreItemDTO,
    ExploreSearchResponseDTO,
    ExplorePostDTO,
)
from domain.explore.repository import ExploreRepository


class ExploreService:
    def __init__(self, repo: ExploreRepository) -> None:
        self._repo = repo

    async def get_explore_list(self) -> ExploreListResponseDTO:
        """탐색 아이템 목록 조회"""
        entities = await self._repo.get_explore_items()
        data = [
            ExploreItemDTO(
                id=e.id,
                type=e.item_type,
                title=e.title,
                category=e.category,
                desc=e.description,
                color=e.color,
            )
            for e in entities
        ]
        return ExploreListResponseDTO(data=data)

    async def search(self, keyword: str) -> ExploreSearchResponseDTO:
        """검색"""
        item_entities = await self._repo.search_items(keyword)
        post_entities = await self._repo.search_posts(keyword) if keyword.strip() else []
        
        items = [
            ExploreItemDTO(
                id=e.id,
                type=e.item_type,
                title=e.title,
                category=e.category,
                desc=e.description,
                color=e.color,
                result_type="item",
            )
            for e in item_entities
        ]
        
        posts = [
            ExplorePostDTO(
                id=e.id,
                type="post",
                title=e.caption[:50] if e.caption else "",
                thumbnail_url=e.thumbnail_url or (e.image_urls[0] if e.image_urls else None),
                hashtags=e.hashtags,
                username=e.username,
                avatar_url=e.avatar_url,
                created_at=e.created_at,
                result_type="post",
            )
            for e in post_entities
        ]
        
        combined = items + posts
        return ExploreSearchResponseDTO(
            q=keyword,
            count=len(combined),
            data=combined,
        )
