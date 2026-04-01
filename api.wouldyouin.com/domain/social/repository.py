# -*- coding: utf-8 -*-
"""
Social Repository
"""
import uuid
from typing import Optional, List
import asyncpg

from domain.social.entity import NotificationEntity, StoryEntity
from domain.social.comment_entity import CommentEntity


class SocialRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    # ── Follow / Unfollow ────────────────────────────────────────────────────────

    async def follow_user(self, user_id: str, target_user_id: str) -> bool:
        """팔로우 추가"""
        async with self._pool.acquire() as conn:
            try:
                await conn.execute(
                    "INSERT INTO vding_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    uuid.UUID(user_id), uuid.UUID(target_user_id),
                )
                return True
            except Exception:
                return False

    async def unfollow_user(self, user_id: str, target_user_id: str) -> None:
        """언팔로우"""
        async with self._pool.acquire() as conn:
            await conn.execute(
                "DELETE FROM vding_follows WHERE follower_id = $1 AND following_id = $2",
                uuid.UUID(user_id), uuid.UUID(target_user_id),
            )

    async def get_profile_stats(self, user_id: str) -> dict:
        """프로필 통계 조회"""
        async with self._pool.acquire() as conn:
            followers = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_follows WHERE following_id = $1",
                uuid.UUID(user_id),
            )
            following = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_follows WHERE follower_id = $1",
                uuid.UUID(user_id),
            )
            post_count = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_posts WHERE user_id = $1 AND type = 'feed' AND (expires_at IS NULL OR expires_at > NOW())",
                uuid.UUID(user_id),
            )
        return {
            "followers": followers or 0,
            "following": following or 0,
            "post_count": post_count or 0,
        }

    # ── Like / Unlike ────────────────────────────────────────────────────────────

    async def like_post(self, user_id: str, post_id: str) -> int:
        """좋아요 추가"""
        async with self._pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO vding_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                uuid.UUID(user_id), uuid.UUID(post_id),
            )
            like_count = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_likes WHERE post_id = $1",
                uuid.UUID(post_id),
            )
            return like_count or 0

    async def unlike_post(self, user_id: str, post_id: str) -> int:
        """좋아요 취소"""
        async with self._pool.acquire() as conn:
            await conn.execute(
                "DELETE FROM vding_likes WHERE user_id = $1 AND post_id = $2",
                uuid.UUID(user_id), uuid.UUID(post_id),
            )
            like_count = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_likes WHERE post_id = $1",
                uuid.UUID(post_id),
            )
            return like_count or 0

    async def get_post_owner(self, post_id: str) -> Optional[str]:
        """게시물 소유자 조회"""
        async with self._pool.acquire() as conn:
            owner_id = await conn.fetchval(
                "SELECT user_id FROM vding_posts WHERE id = $1",
                uuid.UUID(post_id),
            )
            return str(owner_id) if owner_id else None

    # ── Notifications ─────────────────────────────────────────────────────────────

    async def create_notification(
        self,
        user_id: str,
        notification_type: str,
        actor_id: str,
        message: str,
        post_id: Optional[str] = None,
    ) -> None:
        """알림 생성"""
        async with self._pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO vding_notifications (user_id, type, actor_id, post_id, message)
                   VALUES ($1, $2, $3, $4, $5)""",
                uuid.UUID(user_id),
                notification_type,
                uuid.UUID(actor_id),
                uuid.UUID(post_id) if post_id else None,
                message,
            )

    async def get_notification_count(self, user_id: str) -> dict:
        """알림 개수 조회"""
        async with self._pool.acquire() as conn:
            like_count = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_notifications WHERE user_id = $1 AND is_read = FALSE AND type = 'like'",
                uuid.UUID(user_id),
            )
            other_count = await conn.fetchval(
                "SELECT COUNT(*) FROM vding_notifications WHERE user_id = $1 AND is_read = FALSE AND type != 'like'",
                uuid.UUID(user_id),
            )
        return {
            "like_count": like_count or 0,
            "notif_count": other_count or 0,
        }

    async def get_notifications(
        self, user_id: str, page: int = 1, size: int = 20
    ) -> List[NotificationEntity]:
        """알림 목록 조회"""
        offset = (page - 1) * size
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT n.id, n.type, n.message, n.is_read, n.created_at, n.post_id,
                       u.username AS actor_username, u.avatar_url AS actor_avatar
                FROM   vding_notifications n
                LEFT JOIN vding_users u ON u.id = n.actor_id
                WHERE  n.user_id = $1
                ORDER  BY n.created_at DESC
                LIMIT  $2 OFFSET $3
                """,
                uuid.UUID(user_id), size, offset,
            )
            # Mark all as read
            await conn.execute(
                "UPDATE vding_notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
                uuid.UUID(user_id),
            )
        return [NotificationEntity.from_record(dict(r)) for r in rows]

    # ── Stories ─────────────────────────────────────────────────────────────────

    async def get_stories(self, user_id: str) -> List[StoryEntity]:
        """팔로우한 사용자의 스토리 조회"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT DISTINCT ON (p.user_id)
                       p.id AS post_id, p.image_urls, p.created_at,
                       u.id AS uid, u.username, u.name, u.avatar_url
                FROM   vding_posts p
                JOIN   vding_users u ON u.id = p.user_id
                JOIN   vding_follows f ON f.following_id = p.user_id AND f.follower_id = $1
                WHERE  p.type = 'story'
                  AND  p.expires_at > NOW()
                ORDER  BY p.user_id, p.created_at DESC
                """,
                uuid.UUID(user_id),
            )
        return [StoryEntity.from_record(dict(r)) for r in rows]

    # ── Comments ────────────────────────────────────────────────────────────────

    async def create_comment(self, user_id: str, post_id: str, text: str) -> CommentEntity:
        """댓글 생성"""
        async with self._pool.acquire() as conn:
            comment_id = await conn.fetchval(
                """
                INSERT INTO vding_comments (post_id, user_id, text)
                VALUES ($1, $2, $3)
                RETURNING id
                """,
                uuid.UUID(post_id),
                uuid.UUID(user_id),
                text,
            )
            # 사용자 정보와 함께 조회
            row = await conn.fetchrow(
                """
                SELECT c.id, c.post_id, c.user_id, c.text, c.created_at,
                       u.username
                FROM   vding_comments c
                JOIN   vding_users u ON u.id = c.user_id
                WHERE  c.id = $1
                """,
                comment_id,
            )
        return CommentEntity.from_record(dict(row))

    async def get_comments_by_post_id(self, post_id: str) -> List[CommentEntity]:
        """게시물의 댓글 목록 조회"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT c.id, c.post_id, c.user_id, c.text, c.created_at,
                       u.username
                FROM   vding_comments c
                JOIN   vding_users u ON u.id = c.user_id
                WHERE  c.post_id = $1
                ORDER  BY c.created_at ASC
                """,
                uuid.UUID(post_id),
            )
        return [CommentEntity.from_record(dict(r)) for r in rows]
