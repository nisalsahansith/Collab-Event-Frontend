import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, MessageCircle, Send, Trash } from "lucide-react";
import api from "../services/api";

/* ================= TYPES ================= */
interface User {
  _id: string;
  name: string;
  imageURL?: string;
}

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: User;
}

interface Post {
  _id: string;
  description: string;
  tags: string[];
  imageURL?: string;
  likes: string[];
  owner: User;
  createdAt: string;
}

/* ================= COMPONENT ================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const userId = localStorage.getItem("userId");

  /* ================= API ================= */

  const loadComments = async (postId: string) => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = async (postId: string) => {
    const current = showComments[postId];
    if (!current) {
      await loadComments(postId);
    }
    setShowComments((prev) => ({ ...prev, [postId]: !current }));
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;

    try {
      const res = await api.post(`/comments/${postId}`, {
        text: commentText[postId],
      });

      setComments((prev) => ({
        ...prev,
        [postId]: [res.data, ...(prev[postId] || [])],
      }));

      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes.includes(userId!)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId!],
            }
          : p
      )
    );

    try {
      await api.put(`/post/like/${postId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  /* ================= LOAD POSTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const action = await dispatch(fetchPosts());
        const result = unwrapResult(action);
        setPosts(result);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    load();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100">
      <Header handleLogout={() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }} />

      <main className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>

        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-2xl shadow p-4 mb-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.owner.imageURL || "https://www.gravatar.com/avatar?d=mp"}
                className="w-11 h-11 rounded-full"
              />
              <div>
                <p className="font-semibold">{post.owner.name}</p>
                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Body */}
            <p className="mb-3">{post.description}</p>
            {post.imageURL && <img src={post.imageURL} className="w-full rounded-xl max-h-96 object-cover" />}
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">#{tag}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between border-t mt-4 pt-3">
              <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1 ${post.likes.includes(userId!) ? "text-red-500" : "text-gray-600"}`}>
                <Heart size={18} className={post.likes.includes(userId!) ? "fill-red-500" : ""} /> {post.likes.length}
              </button>

              <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1 hover:text-blue-600">
                <MessageCircle size={18} /> Comment
              </button>

              <button onClick={() => navigate("/message", {
                state: { receiverId: post.owner._id, receiverName: post.owner.name, receiverAvatar: post.owner.imageURL }
              })} className="flex items-center gap-1 hover:text-indigo-600">
                <Send size={18} /> Chat
              </button>
            </div>

            {/* COMMENTS */}
            {showComments[post._id] && (
              <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                {comments[post._id]?.map((c) => (
                  <div key={c._id} className="flex gap-2 group relative">
                    <img src={c.user.imageURL || "/avatar.png"} className="w-8 h-8 rounded-full" />
                    <div className="bg-gray-100 px-3 py-2 rounded w-full relative">
                      <p className="font-semibold text-sm">{c.user.name}</p>
                      <p className="text-sm">{c.text}</p>
                      {c.user._id === userId && (
                        <button
                          onClick={() => handleDeleteComment(post._id, c._id)}
                          className="absolute top-2 right-2 text-red-500 hover:underline text-xs"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* ADD COMMENT */}
                <div className="flex items-center gap-3 mt-2 bg-gray-50 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                  <img
                    src="https://www.gravatar.com/avatar?d=mp"
                    className="w-8 h-8 rounded-full"
                  />
                  <input
                    value={commentText[post._id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                  />
                  <button
                    disabled={!commentText[post._id]?.trim()}
                    onClick={() => handleAddComment(post._id)}
                    className={`text-indigo-600 font-semibold transition ${!commentText[post._id]?.trim() ? "opacity-40 cursor-not-allowed" : "hover:text-indigo-700"}`}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
