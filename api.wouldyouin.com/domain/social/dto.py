# -*- coding: utf-8 -*-
"""
Social DTOs
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class FollowRequestDTO:
    target_user_id: str


@dataclass
class LikeRequestDTO:
    post_id: str


@dataclass
class ProfileStatsResponseDTO:
    followers: int
    following: int
    post_count: int


@dataclass
class NotificationCountResponseDTO:
    like_count: int
    notif_count: int


@dataclass
class NotificationItemDTO:
    id: str
    type: str
    message: str
    is_read: bool
    created_at: str
    post_id: Optional[str]
    actor_username: Optional[str]
    actor_avatar: Optional[str]


@dataclass
class NotificationListResponseDTO:
    notifications: List[NotificationItemDTO]
    page: int


@dataclass
class StoryUserDTO:
    id: str
    username: str
    name: Optional[str]
    avatar_url: Optional[str]


@dataclass
class StoryItemDTO:
    id: str
    user: StoryUserDTO
    image_urls: List[str]
    created_at: str


@dataclass
class StoryListResponseDTO:
    stories: List[StoryItemDTO]
