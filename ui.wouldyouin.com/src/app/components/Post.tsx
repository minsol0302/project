import { useState, memo } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { useStore, type Post as PostType } from "../store/useStore";

interface PostProps {
  post: PostType;
}

export const Post = memo(function Post({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const likePost = useStore((state) => state.likePost);
  const savePost = useStore((state) => state.savePost);
  const addComment = useStore((state) => state.addComment);

  const handleLike = () => {
    likePost(post.id);
  };

  const handleSave = () => {
    savePost(post.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post.id, commentText);
      setCommentText("");
    }
  };

  return (
    <article className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Image
            src={post.user.avatar}
            alt={post.user.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm">{post.user.username}</p>
          </div>
        </div>
        <button>
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post image */}
      <div className="relative w-full aspect-square bg-gray-100">
        <Image
          src={post.image}
          alt="Post"
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike}>
              <Heart
                className={`w-6 h-6 ${
                  post.isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
            <button onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="w-6 h-6" />
            </button>
            <button>
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button onClick={handleSave}>
            <Bookmark
              className={`w-6 h-6 ${post.isSaved ? "fill-black" : ""}`}
            />
          </button>
        </div>

        <p className="font-semibold text-sm mb-2">
          좋아요 {post.likes.toLocaleString()}개
        </p>

        <div className="text-sm mb-1">
          <span className="font-semibold mr-2">{post.user.username}</span>
          <span>{post.caption}</span>
        </div>

        {post.comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 mb-1"
          >
            댓글 {post.comments.length}개 모두 보기
          </button>
        )}

        {showComments && (
          <div className="space-y-2 mb-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2">
                  {comment.user.username}
                </span>
                <span>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mb-2">
          {formatDistanceToNow(post.timestamp, {
            addSuffix: true,
            locale: ko,
          })}
        </p>

        {showComments && (
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 border-t pt-2"
          >
            <input
              type="text"
              placeholder="댓글 달기..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`text-sm font-semibold ${
                commentText.trim() ? "text-blue-500" : "text-blue-300"
              }`}
            >
              게시
            </button>
          </form>
        )}
      </div>
    </article>
  );
});
