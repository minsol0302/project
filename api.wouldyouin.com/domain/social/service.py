# -*- coding: utf-8 -*-
"""
Social Service
"""
from typing import List
from fastapi import HTTPException

from domain.social.dto import (
    FollowRequestDTO,
    LikeRequestDTO,
    ProfileStatsResponseDTO,
    NotificationCountResponseDTO,
    NotificationListResponseDTO,
    NotificationItemDTO,
    StoryListResponseDTO,
    StoryItemDTO,
    StoryUserDTO,
)
from domain.social.comment_dto import CreateCommentRequestDTO, CommentResponseDTO
from domain.social.repository import SocialRepository


class SocialService:
    def __init__(self, repo: SocialRepository) -> None:
        self._repo = repo

    async def follow_user(self, user_id: str, dto: FollowRequestDTO) -> dict:
        """팔로우"""
        if dto.target_user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
        success = await self._repo.follow_user(user_id, dto.target_user_id)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Create notification
        await self._repo.create_notification(
            dto.target_user_id,
            "follow",
            user_id,
            "회원님을 팔로우하기 시작했습니다.",
        )
        return {"success": True, "message": "Followed"}

    async def unfollow_user(self, user_id: str, dto: FollowRequestDTO) -> dict:
        """언팔로우"""
        await self._repo.unfollow_user(user_id, dto.target_user_id)
        return {"success": True, "message": "Unfollowed"}

    async def get_profile_stats(self, user_id: str) -> ProfileStatsResponseDTO:
        """프로필 통계 조회"""
        stats = await self._repo.get_profile_stats(user_id)
        return ProfileStatsResponseDTO(
            followers=stats["followers"],
            following=stats["following"],
            post_count=stats["post_count"],
        )

    async def like_post(self, user_id: str, dto: LikeRequestDTO) -> dict:
        """좋아요"""
        like_count = await self._repo.like_post(user_id, dto.post_id)
        
        # Get post owner for notification
        post_owner = await self._repo.get_post_owner(dto.post_id)
        if post_owner and post_owner != user_id:
            await self._repo.create_notification(
                post_owner,
                "like",
                user_id,
                "회원님의 게시물을 좋아합니다.",
                dto.post_id,
            )
        
        return {"success": True, "like_count": like_count}

    async def unlike_post(self, user_id: str, dto: LikeRequestDTO) -> dict:
        """좋아요 취소"""
        like_count = await self._repo.unlike_post(user_id, dto.post_id)
        return {"success": True, "like_count": like_count}

    async def get_notification_count(self, user_id: str) -> NotificationCountResponseDTO:
        """알림 개수 조회"""
        counts = await self._repo.get_notification_count(user_id)
        return NotificationCountResponseDTO(
            like_count=counts["like_count"],
            notif_count=counts["notif_count"],
        )

    async def get_notifications(
        self, user_id: str, page: int = 1, size: int = 20
    ) -> NotificationListResponseDTO:
        """알림 목록 조회"""
        entities = await self._repo.get_notifications(user_id, page, size)
        notifications = [
            NotificationItemDTO(
                id=e.id,
                type=e.type,
                message=e.message,
                is_read=e.is_read,
                created_at=e.created_at,
                post_id=e.post_id,
                actor_username=e.actor_username,
                actor_avatar=e.actor_avatar,
            )
            for e in entities
        ]
        return NotificationListResponseDTO(
            notifications=notifications,
            page=page,
        )

    async def get_stories(self, user_id: str) -> StoryListResponseDTO:
        """스토리 조회"""
        entities = await self._repo.get_stories(user_id)
        stories = [
            StoryItemDTO(
                id=e.id,
                user=StoryUserDTO(
                    id=e.user_id,
                    username=e.username,
                    name=e.name,
                    avatar_url=e.avatar_url,
                ),
                image_urls=e.image_urls,
                created_at=e.created_at,
            )
            for e in entities
        ]
        return StoryListResponseDTO(stories=stories)

    # ── Comments ────────────────────────────────────────────────────────────────

    async def create_comment(self, user_id: str, dto: CreateCommentRequestDTO) -> CommentResponseDTO:
        """댓글 생성"""
        entity = await self._repo.create_comment(user_id, dto.post_id, dto.text)
        
        # 알림 생성
        post_owner = await self._repo.get_post_owner(dto.post_id)
        if post_owner and post_owner != user_id:
            await self._repo.create_notification(
                post_owner,
                "comment",
                user_id,
                "회원님의 게시물에 댓글을 남겼습니다.",
                dto.post_id,
            )
        
        return CommentResponseDTO(
            id=entity.id,
            post_id=entity.post_id,
            user_id=entity.user_id,
            username=entity.username,
            text=entity.text,
            created_at=entity.created_at,
        )

    async def get_comments(self, post_id: str) -> List[CommentResponseDTO]:
        """댓글 목록 조회"""
        entities = await self._repo.get_comments_by_post_id(post_id)
        return [
            CommentResponseDTO(
                id=e.id,
                post_id=e.post_id,
                user_id=e.user_id,
                username=e.username,
                text=e.text,
                created_at=e.created_at,
            )
            for e in entities
        ]
