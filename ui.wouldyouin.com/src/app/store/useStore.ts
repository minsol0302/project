/**
 * TODO: SNS 피드/스토리가 실제 API(/api/feed, /api/profile/posts)와
 *       연동되면 이 파일의 목업 데이터와 store를 제거합니다.
 * 현재 사용처: (sns)/feed/page.tsx, components/Stories.tsx,
 *             components/Post.tsx, (sns)/learning/page.tsx
 */
import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
}

export interface Post {
  id: string;
  user: User;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: Date;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: Date;
}

export interface Story {
  id: string;
  user: User;
  isViewed: boolean;
}

interface AppState {
  currentUser: User;
  posts: Post[];
  stories: Story[];
  likePost: (postId: string) => void;
  savePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
}

// 한국인 사용자 목업 데이터
const mockUsers: User[] = [
  {
    id: "1",
    username: "jihye.kim",
    name: "김지혜",
    avatar:
      "https://images.unsplash.com/photo-1635353866477-f77a828b431a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    bio: "서울 기반 패션 블로거 👗",
    followers: 12500,
    following: 432,
    posts: 156,
  },
  {
    id: "2",
    username: "minho_lee",
    name: "이민호",
    avatar:
      "https://images.unsplash.com/photo-1723309157645-e9e710790d6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    bio: "여행과 사진 📸",
    followers: 8900,
    following: 521,
    posts: 98,
  },
  {
    id: "3",
    username: "seoyeon.park",
    name: "박서연",
    avatar:
      "https://images.unsplash.com/photo-1736297029116-1ecd46dca956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    bio: "맛집 탐방 중 🍽️",
    followers: 15600,
    following: 678,
    posts: 234,
  },
  {
    id: "4",
    username: "joon.choi",
    name: "최준",
    avatar:
      "https://images.unsplash.com/photo-1723309157645-e9e710790d6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    bio: "부산 라이프스타일 ☀️",
    followers: 7800,
    following: 345,
    posts: 112,
  },
];

// 한국 이미지로 구성된 피드 목업 데이터
const mockPosts: Post[] = [
  {
    id: "1",
    user: mockUsers[0],
    image:
      "https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption:
      "오늘의 OOTD ✨ 강남에서 촬영했어요! #패션 #데일리룩 #강남",
    likes: 1234,
    comments: [],
    timestamp: new Date("2026-03-02T10:30:00"),
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    user: mockUsers[2],
    image:
      "https://images.unsplash.com/photo-1661366394743-fe30fe478ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption:
      "점심은 역시 한식이지 🍚 이 집 진짜 맛있어요! #한식 #맛집 #먹스타그램",
    likes: 2341,
    comments: [],
    timestamp: new Date("2026-03-02T12:15:00"),
    isLiked: false,
    isSaved: false,
  },
  {
    id: "3",
    user: mockUsers[1],
    image:
      "https://images.unsplash.com/photo-1722074655328-b2a477c52e8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption: "서울 야경은 언제 봐도 좋다 🌃 #서울 #야경 #사진",
    likes: 3456,
    comments: [],
    timestamp: new Date("2026-03-01T20:45:00"),
    isLiked: true,
    isSaved: false,
  },
  {
    id: "4",
    user: mockUsers[3],
    image:
      "https://images.unsplash.com/photo-1717178319504-2519647dfc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption: "부산 해운대에서 🏖️ 날씨 최고! #부산 #해운대 #바다",
    likes: 4567,
    comments: [],
    timestamp: new Date("2026-03-01T15:20:00"),
    isLiked: false,
    isSaved: true,
  },
  {
    id: "5",
    user: mockUsers[2],
    image:
      "https://images.unsplash.com/photo-1652189684524-4fb0c0a9850b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption:
      "감성 카페 발견 ☕ 분위기 너무 좋아요 #카페 #감성 #데이트",
    likes: 1890,
    comments: [],
    timestamp: new Date("2026-03-01T14:00:00"),
    isLiked: false,
    isSaved: false,
  },
  {
    id: "6",
    user: mockUsers[0],
    image:
      "https://images.unsplash.com/photo-1702737970106-4aaa703f940c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption:
      "강남 밤거리 산책 🌙✨ #강남 #야경 #서울나들이",
    likes: 2100,
    comments: [],
    timestamp: new Date("2026-02-28T21:30:00"),
    isLiked: false,
    isSaved: false,
  },
  {
    id: "7",
    user: mockUsers[1],
    image:
      "https://images.unsplash.com/photo-1544032659-d12c28f0a38a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    caption: "한복 입고 경복궁 나들이 👘 #한복 #경복궁 #전통",
    likes: 5678,
    comments: [],
    timestamp: new Date("2026-02-28T13:00:00"),
    isLiked: true,
    isSaved: false,
  },
];

const mockStories: Story[] = [
  { id: "s1", user: mockUsers[0], isViewed: false },
  { id: "s2", user: mockUsers[1], isViewed: false },
  { id: "s3", user: mockUsers[2], isViewed: true },
  { id: "s4", user: mockUsers[3], isViewed: false },
];

export const useStore = create<AppState>((set) => ({
  currentUser: {
    id: "current",
    username: "you_username",
    name: "나",
    avatar:
      "https://images.unsplash.com/photo-1635353866477-f77a828b431a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    bio: "안녕하세요! 반가워요 👋",
    followers: 542,
    following: 321,
    posts: 45,
  },
  posts: mockPosts,
  stories: mockStories,

  likePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    })),

  savePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post,
      ),
    })),

  addComment: (postId, text) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now().toString(),
                  user: state.currentUser,
                  text,
                  timestamp: new Date(),
                },
              ],
            }
          : post,
      ),
    })),
}));

