import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReactMarkdown from "react-markdown";
import { Heart, MessageCircle, Trash, MoreHorizontal, Edit3, X, Image as ImageIcon, UploadCloud } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ================= TYPES ================= */
interface User {
  imageURL: string;
  _id: string;
  name: string;
  image?: string;
  bio?: string; // Added bio for UI completeness
}

interface Post {
  _id: string;
  description: string;
  tags: string[];
  imageURL?: string;
  createdAt: string;
  likes: string[];
  owner: User;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string; // Ensure backend sends this
}

/* ================= CONST ================= */
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar?d=mp";
const DESC_LIMIT = 150;
const TAGS_LIMIT = 3;

/* ================= COMPONENT ================= */
export default function ProfilePage() {
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Edit Form States
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Interaction States
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getPreview = (text: string, limit = DESC_LIMIT) =>
    text.length <= limit ? text : text.slice(0, limit) + "...";

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!userId) return;

    api.get("/auth/me").then((res) => setUser(res.data.data));

    const fetchPosts = async () => {
      try {
        const res = await api.get(`/post/user/${userId}`);
        const postsArray: Post[] = Array.isArray(res.data.posts)
          ? res.data.posts
          : Array.isArray(res.data)
          ? res.data
          : [];
        setPosts(postsArray);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load posts");
      }
    };

    fetchPosts();
  }, [userId]);

  /* ================= CLOSE MENUS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = () => setMenuPostId(null);
    if(menuPostId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuPostId]);

  /* ================= COMMENTS ================= */
  const loadComments = async (postId: string) => {
    const res = await api.get(`/comments/${postId}`);
    setComments((prev) => ({ ...prev, [postId]: res.data }));
  };

  const toggleComments = async (postId: string) => {
    if (!showComments[postId]) await loadComments(postId);
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const res = await api.post(`/comments/${postId}`, { text: commentText[postId] });
      setComments((prev) => ({
        ...prev,
        [postId]: [res.data, ...(prev[postId] || [])],
      }));
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c._id !== commentId),
      }));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  /* ================= ACTIONS ================= */
  const toggleLike = async (postId: string) => {
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
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleDelete = (postId: string) => setDeleteConfirmId(postId);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/post/delete/${deleteConfirmId}`);
      setPosts((p) => p.filter((x) => x._id !== deleteConfirmId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  /* ================= EDIT LOGIC ================= */
  const openEdit = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent menu close from triggering immediately
    setEditingPost(post);
    setDesc(post.description || "");
    setTags(post.tags || []);
    setPreview(post.imageURL || null);
    setTagsInput("");
    setImageFile(null);
    setMenuPostId(null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setTags([...tags, tagsInput.trim()]);
      }
      setTagsInput("");
    }
  };

  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!editingPost) return;
    setUpdating(true);
    const fd = new FormData();
    fd.append("description", desc);
    fd.append("tags", tags.join(","));
    if (imageFile) fd.append("image", imageFile);

    try {
      await api.put(`/post/update/${editingPost._id}`, fd, { timeout: 10000 });
      const postsRes = await api.get(`/post/user/${userId}`);
      setPosts(postsRes.data.posts || postsRes.data || []);
      toast.success("Post updated");
      setEditingPost(null);
      setPreview(null);
    } catch {
      toast.error("Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />
      <Header handleLogout={() => {
              localStorage.clear();
              window.location.href = "/login";
            }} />

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* PROFILE HEADER */}
          {user && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
              
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-full p-1 bg-white shadow-md">
                   <img
                    src={user.image || DEFAULT_AVATAR}
                    className="w-full h-full rounded-full object-cover"
                    alt={user.name}
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left z-10 md:mt-4">
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-slate-500 font-medium mt-1">Creator & Enthusiast</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                   <div className="text-center">
                      <span className="block font-bold text-lg text-slate-800">{posts.length}</span>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Posts</span>
                   </div>
                   <div className="text-center">
                      <span className="block font-bold text-lg text-slate-800">0</span>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Followers</span>
                   </div>
                   <div className="text-center">
                      <span className="block font-bold text-lg text-slate-800">0</span>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Following</span>
                   </div>
                </div>
              </div>

              <button className="md:mt-4 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm z-10">
                Edit Profile
              </button>
            </div>
          )}

          {/* POSTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {posts.map((post) => {
              const isDescExpanded = expandedDesc[post._id] || false;
              
              return (
                <div key={post._id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col">
                  
                  {/* Post Header */}
                  <div className="p-4 flex justify-between items-center border-b border-slate-50">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                    </span>
                    
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuPostId(menuPostId === post._id ? null : post._id)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {menuPostId === post._id && (
                        <div className="absolute right-0 mt-2 bg-white border border-slate-100 shadow-lg rounded-xl w-40 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={(e) => openEdit(post, e)}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {post.imageURL && (
                    <div className="w-full h-64 bg-slate-100 relative group overflow-hidden">
                      <img src={post.imageURL} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Post" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="prose prose-sm prose-slate max-w-none text-slate-600 mb-3">
                      <ReactMarkdown>
                         {post.description.length <= DESC_LIMIT || isDescExpanded ? post.description : getPreview(post.description)}
                      </ReactMarkdown>
                    </div>
                    
                    {post.description.length > DESC_LIMIT && (
                      <button
                        onClick={() => setExpandedDesc((prev) => ({ ...prev, [post._id]: !isDescExpanded }))}
                        className="text-indigo-600 text-xs font-bold hover:underline mb-4 self-start"
                      >
                        {isDescExpanded ? "SHOW LESS" : "READ MORE"}
                      </button>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, TAGS_LIMIT).map((t) => (
                          <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium">#{t}</span>
                        ))}
                        {post.tags.length > TAGS_LIMIT && (
                           <span className="text-xs text-slate-400 py-1 font-medium">+{post.tags.length - TAGS_LIMIT} more</span>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post._id)}
                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                          post.likes.includes(userId!) ? "text-rose-500" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Heart size={18} className={post.likes.includes(userId!) ? "fill-current" : ""} />
                        {post.likes.length}
                      </button>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                            showComments[post._id] ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <MessageCircle size={18} />
                        {comments[post._id]?.length || 0}
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="bg-slate-50/80 p-4 border-t border-slate-100">
                      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar mb-3">
                        {comments[post._id]?.map((c) => (
                          <div key={c._id} className="flex gap-3 group">
                            <img
                              src={c.user.imageURL || DEFAULT_AVATAR}
                              className="w-8 h-8 rounded-full border border-white shadow-sm flex-shrink-0"
                            />
                            <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative">
                              <p className="font-bold text-xs text-slate-800 mb-0.5">{c.user.name}</p>
                              <p className="text-sm text-slate-600">{c.text}</p>
                              {c.user._id === userId && (
                                <button
                                  onClick={() => deleteComment(post._id, c._id)}
                                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {(!comments[post._id] || comments[post._id].length === 0) && (
                            <p className="text-center text-xs text-slate-400 italic py-2">No comments yet.</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addComment(post._id)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                        />
                        <button
                          disabled={!commentText[post._id]?.trim()}
                          onClick={() => addComment(post._id)}
                          className="text-indigo-600 text-sm font-bold px-3 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <ImageIcon size={48} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-700">No posts yet</h3>
               <p className="text-slate-500 max-w-sm mt-2">Share your first project or idea with the community to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Edit Post</h2>
                <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm hover:shadow transition-all">
                    <X size={18} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full h-32 border border-slate-200 rounded-xl p-4 mb-5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
                placeholder="What's on your mind?"
                disabled={updating}
              />

              <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
              <div className="border border-slate-200 rounded-xl p-2 mb-5 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all bg-white">
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="bg-indigo-50 text-indigo-700 text-sm px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                            #{tag}
                            <button onClick={() => removeTag(index)} className="hover:text-red-500"><X size={12}/></button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                    className="w-full outline-none text-sm px-1 py-1 bg-transparent"
                    disabled={updating}
                />
              </div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group relative overflow-hidden"
              >
                 <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={updating}
                />
                
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <UploadCloud size={32} className="mb-2"/>
                        <p className="text-sm font-medium">Click to upload new image</p>
                    </div>
                )}
                
                {preview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">Change Image</p>
                    </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-50 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setEditingPost(null)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                disabled={updating}
              >
                {updating ? "Saving Changes..." : "Update Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Post?</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-100 transition-all active:scale-95"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}