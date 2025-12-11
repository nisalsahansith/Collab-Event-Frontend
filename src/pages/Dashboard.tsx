import React, { useEffect, useState } from "react"; 
import { useDispatch } from "react-redux";
import { fetchPosts } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, MessageCircle, Send, Trash, Home, Plus, Bookmark, User, Settings } from "lucide-react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";

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

/* ================= SIDEBARS ================= */
function LeftSidebar() {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow rounded-xl p-5 sticky top-20 flex flex-col gap-5">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <Home size={20} /> Home
      </button>
      <button onClick={() => navigate("/message")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <MessageCircle size={20} /> Chat
      </button>
      <button onClick={() => navigate("/create-post")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <Plus size={20} /> Create Post
      </button>
      <button onClick={() => navigate("/myprofile")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <User size={20} /> My Profile
      </button>
      <button onClick={() => navigate("/setting")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <Settings size={20} /> Setting
      </button>
    </div>
  );
}

interface UserInfo {
  name: string;
  imageURL?: string;
}

// RightSidebar component
function RightSidebar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`); // adjust endpoint if needed
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div className="bg-white shadow rounded-xl p-5 sticky top-20 flex flex-col gap-6">
      <div>
        <h3 className="font-semibold mb-3 text-gray-800">Trending Tags</h3>
        <div className="space-y-2">
          {["#AI", "#Fitness", "#Coding", "#Travel"].map((tag) => (
            <p key={tag} className="text-blue-600 cursor-pointer hover:underline">{tag}</p>
          ))}
        </div>
      </div>

      {user && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">You</h3>
          <div className="flex items-center gap-3">
            <img
              src={user.imageURL || "https://www.gravatar.com/avatar?d=mp"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <button onClick={() => navigate("/setting")} className="text-indigo-600 text-sm">Edit Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getPreview = (text: string, limit = 120) => (text.length <= limit ? text : text.slice(0, limit) + "...");

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
    if (!current) await loadComments(postId);
    setShowComments((prev) => ({ ...prev, [postId]: !current }));
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const res = await api.post(`/comments/${postId}`, { text: commentText[postId] });
      setComments((prev) => ({ ...prev, [postId]: [res.data, ...(prev[postId] || [])] }));
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
              likes: p.likes.includes(userId!) ? p.likes.filter((id) => id !== userId) : [...p.likes, userId!],
            }
          : p
      )
    );
    try { await api.put(`/post/like/${postId}`); } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => ({ ...prev, [postId]: prev[postId].filter((c) => c._id !== commentId) }));
    } catch (err) { console.error(err); alert("Failed to delete comment"); }
  };

  /* ================= LOAD POSTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const action = await dispatch(fetchPosts());
        const result = unwrapResult(action);
        setPosts(result);
      } catch (err) { console.error("Fetch error:", err); }
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

      <div className="flex max-w-6xl mx-auto gap-6 py-10 px-2">
        {/* Left Sidebar */}
        <div className="hidden md:block w-64"><LeftSidebar /></div>

        {/* Feed */}
        <main className="flex-1 max-w-2xl">
          {/* <h1 className="text-3xl font-bold mb-6 text-gray-800">Latest Posts</h1> */}

          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-2xl shadow p-4 mb-6">

              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <img src={post.owner.imageURL || "https://www.gravatar.com/avatar?d=mp"} className="w-11 h-11 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-800">{post.owner.name}</p>
                  <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3 prose prose-sm max-w-none whitespace-pre-line text-gray-800">
                <ReactMarkdown>
                  {expanded[post._id] ? post.description : getPreview(post.description)}
                </ReactMarkdown>
              </div>
              {post.description.length > 120 && (
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                  className="text-indigo-600 text-sm font-medium hover:underline mb-3"
                >
                  {expanded[post._id] ? "Show less" : "Read more"}
                </button>
              )}

              {/* Post Image */}
              {post.imageURL && (
                <img
                  src={post.imageURL}
                  className="w-full rounded-xl max-h-96 object-cover cursor-pointer"
                  onClick={() => setFullImage(post.imageURL || null)}
                />
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between border-t mt-4 pt-3">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-1 transition-transform ${post.likes.includes(userId!) ? "text-red-500 scale-125" : "text-gray-600 scale-100"}`}
                >
                  <Heart size={18} className={post.likes.includes(userId!) ? "fill-red-500" : ""} /> {post.likes.length}
                </button>
                <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1 hover:text-blue-600">
                  <MessageCircle size={18} /> Comment
                </button>
                <button onClick={() => navigate("/message", { state: { receiverId: post.owner._id, receiverName: post.owner.name, receiverAvatar: post.owner.imageURL } })} className="flex items-center gap-1 hover:text-indigo-600">
                  <Send size={18} /> Chat
                </button>
              </div>

              {/* COMMENTS */}
              {showComments[post._id] && (
                <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                  {comments[post._id]?.map((c) => (
                    <div key={c._id} className="flex gap-2 group relative">
                      <img src={c.user.imageURL || "https://www.gravatar.com/avatar?d=mp"} className="w-8 h-8 rounded-full" />
                      <div className="bg-gray-100 px-3 py-2 rounded w-full relative">
                        <p className="font-semibold text-sm">{c.user.name}</p>
                        <p className="text-sm">{c.text}</p>
                        {c.user._id === userId && (
                          <button onClick={() => handleDeleteComment(post._id, c._id)} className="absolute top-2 right-2 text-red-500 hover:underline text-xs">
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex items-center gap-3 mt-2 bg-gray-50 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                    <img src="https://www.gravatar.com/avatar?d=mp" className="w-8 h-8 rounded-full" />
                    <input
                      value={commentText[post._id] || ""}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800"
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

              {/* Full Image Modal */}
              {fullImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setFullImage(null)}>
                  <div className="relative max-w-4xl w-full p-4" onClick={(e) => e.stopPropagation()}>
                    <img src={fullImage} className="w-full max-h-[90vh] object-contain rounded-lg" />
                    <button className="absolute top-3 right-3 bg-white text-black px-4 py-1 rounded-full text-sm font-semibold shadow hover:bg-gray-200" onClick={() => setFullImage(null)}>Close</button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </main>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-72"><RightSidebar /></div>
      </div>

      <Footer />
    </div>
  );
}
