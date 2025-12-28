import React, { useEffect, useState } from "react"; 
import { useDispatch } from "react-redux";
import { fetchPosts } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, MessageCircle, Send, Trash, Home, Plus, User, Settings, X, Hash, MoreHorizontal } from "lucide-react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import toast, { Toaster } from "react-hot-toast";

/* ================= TYPES ================= */
interface User { _id: string; name: string; imageURL?: string; }
interface Comment { _id: string; text: string; createdAt: string; user: User; }
interface Post { _id: string; description: string; tags: string[]; imageURL?: string; likes: string[]; owner: User; createdAt: string; reports?: any[]; }

/* ================= SIDEBAR LEFT ================= */
function LeftSidebar() {
  const navigate = useNavigate();
  const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => (
    <button 
      onClick={() => navigate(path)} 
      className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group w-full text-left"
    >
      <Icon size={22} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /> 
      {label}
    </button>
  );

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sticky top-24 flex flex-col gap-2">
      <NavItem icon={Home} label="Feed" path="/dashboard" />
      <NavItem icon={MessageCircle} label="Messages" path="/message" />
      <NavItem icon={Plus} label="Create Post" path="/create-post" />
      <NavItem icon={User} label="Profile" path="/myprofile" />
      <div className="h-px bg-slate-100 my-2 mx-4"></div>
      <NavItem icon={Settings} label="Settings" path="/setting" />
    </div>
  );
}

/* ================= SIDEBAR RIGHT ================= */
function RightSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    api.get(`/users/${userId}`).then(res => setUser(res.data)).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      {/* Trending Card */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Hash size={18} className="text-indigo-500"/> Trending Now
        </h3>
        <div className="flex flex-wrap gap-2">
          {["#AI", "#Fitness", "#Coding", "#Travel", "#React"].map(tag => (
            <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-slate-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* User Mini Profile */}
      {user && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.imageURL || "https://www.gravatar.com/avatar?d=mp"} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              alt="Profile"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500">View full profile</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/setting")} 
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= MAIN DASHBOARD ================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showMoreTags, setShowMoreTags] = useState<Record<string, boolean>>({});

  // Report modal states
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const getPreview = (t: string, l = 120) => t.length <= l ? t : t.slice(0, l) + "...";

  /* LOAD POSTS & HIDE OWN POSTS */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = unwrapResult(await dispatch(fetchPosts()));
        const filtered = res.filter((p: Post) => p.owner._id !== userId); 
        setPosts(filtered);
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, []);

  const loadComments = async (id: string) => {
    const res = await api.get(`/comments/${id}`);
    setComments(p => ({ ...p, [id]: res.data }));
  };

  const toggleComments = async (id: string) => {
    if (!showComments[id]) await loadComments(id);
    setShowComments(p => ({ ...p, [id]: !p[id] }));
  };

  const addComment = async (id: string) => {
    if (!commentText[id]?.trim()) return;
    const res = await api.post(`/comments/${id}`, { text: commentText[id] });
    setComments(p => ({ ...p, [id]: [res.data, ...(p[id] || [])] }));
    setCommentText(p => ({ ...p, [id]: "" }));
  };

  const like = async (id: string) => {
    setPosts(p => p.map(x => x._id === id ? { ...x, likes: x.likes.includes(userId!) ? x.likes.filter(a => a !== userId) : [...x.likes, userId!] } : x));
    await api.put(`/post/like/${id}`);
  };

  const deleteComment = async (pid: string, cid: string) => {
    await api.delete(`/comments/${cid}`);
    setComments(p => ({ ...p, [pid]: p[pid].filter(c => c._id !== cid) }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      <Header handleLogout={() => {
        localStorage.clear();
        window.location.href = "/login";
      }} />

      <div className="flex max-w-7xl mx-auto gap-8 py-8 px-4 sm:px-6">

        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Main Feed */}
        <main className="flex-1 max-w-2xl mx-auto w-full">
          
          {posts.length === 0 && (
             <div className="text-center py-20 opacity-50">
                <p>No posts found. Follow some people to get started!</p>
             </div>
          )}

          {posts.map(post => {
            const isLiked = post.likes.includes(userId!);
            
            return (
              <div key={post._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 overflow-hidden">

                {/* Post Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.owner.imageURL || "https://www.gravatar.com/avatar?d=mp"} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 cursor-pointer hover:opacity-90"
                      alt={post.owner.name}
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight hover:underline cursor-pointer">{post.owner.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* 3 Dots Report Button */}
                  <button
                    onClick={() => setReportingPost(post)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Description */}
                <div className="px-4 pb-2 text-slate-700 leading-relaxed text-[15px]">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      a: ({node, ...props}) => <a className="text-indigo-600 hover:underline" {...props} />
                    }}
                  >
                    {expanded[post._id] ? post.description : getPreview(post.description)}
                  </ReactMarkdown>
                  {post.description.length > 120 && (
                    <button 
                      onClick={() => setExpanded(p => ({ ...p, [post._id]: !p[post._id] }))}
                      className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 mt-1"
                    >
                      {expanded[post._id] ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>

                {/* Image */}
                {post.imageURL && (
                  <div className="mt-2 bg-slate-100 cursor-pointer relative group" onClick={() => setFullImage(post.imageURL ?? null)}>
                    <img src={post.imageURL} className="w-full h-auto max-h-[500px] object-cover" alt="Post content"/>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center"></div>
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="px-4 pt-3 flex flex-wrap gap-2">
                    {(showMoreTags[post._id] ? post.tags : post.tags.slice(0, 5)).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold tracking-wide">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 5 && (
                      <button onClick={() => setShowMoreTags(p => ({ ...p, [post._id]: !p[post._id] }))} className="text-slate-500 text-xs font-medium hover:text-indigo-600">
                        {showMoreTags[post._id] ? "Less" : `+${post.tags.length - 5} more`}
                      </button>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="px-2 py-2 mt-2 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => like(post._id)} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isLiked ? "text-rose-500 bg-rose-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                    >
                      <Heart size={20} className={`transition-transform duration-300 ${isLiked ? "fill-rose-500 scale-110" : ""}`} /> 
                      <span className="font-semibold text-sm">{post.likes.length > 0 ? post.likes.length : "Like"}</span>
                    </button>

                    <button 
                      onClick={() => toggleComments(post._id)} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showComments[post._id] ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                    >
                      <MessageCircle size={20} /> 
                      <span className="font-semibold text-sm">Comment</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => navigate("/message", { state: { receiverId: post.owner._id, receiverName: post.owner.name, receiverAvatar: post.owner.imageURL } })}
                    className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>

                {/* Comment Section */}
                {showComments[post._id] && (
                  <div className="bg-slate-50/50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="relative flex-1">
                        <input 
                          value={commentText[post._id] || ""}
                          onChange={e => setCommentText(p => ({ ...p, [post._id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && addComment(post._id)}
                          placeholder="Write a thoughtful comment..."
                          className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-full py-2.5 px-4 pl-4 pr-12 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                        />
                        <button 
                          disabled={!commentText[post._id]?.trim()}
                          onClick={() => addComment(post._id)}
                          className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          <Send size={14} className="ml-0.5"/>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                      {comments[post._id]?.map(c => (
                        <div key={c._id} className="flex gap-3 group">
                          <img src={c.user.imageURL || "https://www.gravatar.com/avatar?d=mp"} className="w-8 h-8 rounded-full object-cover mt-1"/>
                          <div className="flex-1">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative group-hover:border-indigo-100 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-xs text-slate-900">{c.user.name}</span>
                                {c.user._id === userId && (
                                  <button onClick={() => deleteComment(post._id, c._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash size={13} />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 leading-snug">{c.text}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium ml-1 mt-1 block">
                              {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      ))}
                      {!comments[post._id]?.length && (
                         <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* Right Sidebar (Desktop) */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <RightSidebar />
        </div>

      </div>

      <Footer />

      {/* Full Image Modal */}
      {fullImage && (
        <div 
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" 
          onClick={() => setFullImage(null)}
        >
          <div className="relative max-w-5xl w-full flex justify-center" onClick={e => e.stopPropagation()}>
             <button 
              onClick={() => setFullImage(null)}
              className="absolute -top-12 right-0 md:right-auto md:absolute md:-right-12 text-white/70 hover:text-white hover:scale-110 transition-all"
            >
              <X size={32} />
            </button>
            <img 
              src={fullImage} 
              className="w-auto h-auto max-h-[90vh] max-w-full rounded-lg shadow-2xl"
              alt="Full view"
            />
          </div>
        </div>
      )}
       <div>
      <Toaster position="top-right" reverseOrder={false} />
      {/* Rest of your Dashboard JSX */}
    </div>

      {/* Report Post Modal */}
      {reportingPost && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setReportingPost(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3">Report Post</h3>
            <p className="text-sm text-slate-600 mb-4">
              Why do you want to report this post by <strong>{reportingPost.owner.name}</strong>?
            </p>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter your reason..."
              className="w-full border border-slate-200 rounded-lg p-3 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportingPost(null)}
                className="py-2 px-4 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={reportLoading || !reportReason.trim()}
                onClick={async () => {
                  try {
                    setReportLoading(true);
                    await api.post(`/reports/post/${reportingPost._id}`, { reason: reportReason });
                    toast.success("Post reported successfully!");
                    setReportingPost(null);
                    setReportReason("");
                  } catch (err: any) {
                    toast.error(err.response?.data?.msg || "Failed to report post");
                  } finally {
                    setReportLoading(false);
                  }
                }}
                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {reportLoading ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
