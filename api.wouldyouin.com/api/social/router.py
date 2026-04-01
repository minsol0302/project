# -*- coding: utf-8 -*-
"""
Social API Router
라우터 레이어: 요청/응답 처리만 담당
비즈니스 로직: domain.social.service에서 처리
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from core.database import get_pool
from core.security import verify_access_token
from domain.social.dto import FollowRequestDTO, LikeRequestDTO
from domain.social.comment_dto import CreateCommentRequestDTO
from domain.social.repository import SocialRepository
from domain.social.service import SocialService

router = APIRouter()
_security = HTTPBearer(auto_error=False)


def _get_user_id(creds: HTTPAuthorizationCredentials = Depends(_security)) -> str:
    if not creds:
        raise HTTPException(status_code=401, detail="Auth required")
    payload = verify_access_token(creds.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


# ── Follow / Unfollow ────────────────────────────────────────────────────────


class FollowRequest(BaseModel):
    target_user_id: str


@router.post("/follow", summary="Follow a user")
async def follow_user(body: FollowRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    dto = FollowRequestDTO(target_user_id=body.target_user_id)
    return await service.follow_user(user_id, dto)


@router.post("/unfollow", summary="Unfollow a user")
async def unfollow_user(body: FollowRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    dto = FollowRequestDTO(target_user_id=body.target_user_id)
    return await service.unfollow_user(user_id, dto)


@router.get("/profile-stats", summary="Get follower/following counts for a user")
async def get_profile_stats(user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    result = await service.get_profile_stats(user_id)
    return {
        "followers": result.followers,
        "following": result.following,
        "post_count": result.post_count,
    }


# ── Like / Unlike ────────────────────────────────────────────────────────────


class LikeRequest(BaseModel):
    post_id: str


@router.post("/like", summary="Like a post")
async def like_post(body: LikeRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    dto = LikeRequestDTO(post_id=body.post_id)
    return await service.like_post(user_id, dto)


@router.post("/unlike", summary="Unlike a post")
async def unlike_post(body: LikeRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    dto = LikeRequestDTO(post_id=body.post_id)
    return await service.unlike_post(user_id, dto)


# ── Notifications ─────────────────────────────────────────────────────────────


@router.get("/notifications/count", summary="Unread notification count")
async def get_notification_count(user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    result = await service.get_notification_count(user_id)
    return {
        "like_count": result.like_count,
        "notif_count": result.notif_count,
    }


@router.get("/notifications", summary="Notification list")
async def get_notifications(
    page: int = Query(1),
    size: int = Query(20),
    user_id: str = Depends(_get_user_id),
):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    result = await service.get_notifications(user_id, page, size)
    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,
                "post_id": n.post_id,
                "actor_username": n.actor_username,
                "actor_avatar": n.actor_avatar,
            }
            for n in result.notifications
        ],
        "page": result.page,
    }


# ── Stories ─────────────────────────────────────────────────────────────────


@router.get("/stories", summary="Stories from followed users (active, <24h)")
async def get_stories(user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    result = await service.get_stories(user_id)
    return {
        "stories": [
            {
                "id": s.id,
                "user": {
                    "id": s.user.id,
                    "username": s.user.username,
                    "name": s.user.name,
                    "avatar_url": s.user.avatar_url,
                },
                "image_urls": s.image_urls,
                "created_at": s.created_at,
            }
            for s in result.stories
        ]
    }


# ── Comments ────────────────────────────────────────────────────────────────────


class CommentRequest(BaseModel):
    post_id: str
    text: str


@router.post("/comments", summary="Create a comment")
async def create_comment(body: CommentRequest, user_id: str = Depends(_get_user_id)):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    dto = CreateCommentRequestDTO(post_id=body.post_id, text=body.text)
    result = await service.create_comment(user_id, dto)
    return {"comment": result}


@router.get("/comments", summary="Get comments for a post")
async def get_comments(
    post_id: str = Query(..., description="Post ID"),
    user_id: str = Depends(_get_user_id),
):
    pool = await get_pool()
    repo = SocialRepository(pool)
    service = SocialService(repo)

    comments = await service.get_comments(post_id)
    return {"comments": comments}
