import { useEffect, useState } from "react";
import api from "../services/api"; // your axios instance
import toast from "react-hot-toast";
import { 
  Trash2, Eye, XCircle, Loader2, 
  AlertTriangle, CheckCircle, FileText, Calendar, Filter 
} from "lucide-react";

// --- TYPES ---
interface Report {
  userId: { name: string; _id: string };
  reason: string;
  date: string;
}

interface Post {
  _id: string;
  description: string;
  imageURL?: string;
  reports: Report[]; // Assuming backend populates this array for all posts (empty if none)
  createdAt: string;
  user?: { name: string; email: string }; // Optional: Owner info
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<"all" | "reported" | "clean">("all");

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // --- API ACTIONS ---
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      // Changed endpoint to fetch ALL posts
      // Ensure your backend returns the 'reports' array for every post
      const res = await api.get("/admin/posts"); 
      setPosts(res.data.posts || res.data); // Adjust based on your actual API response structure
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    // Custom Toast for confirmation
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-slate-800">Delete this post permanently?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
            }}
            className="bg-rose-600 text-white px-3 py-1 rounded text-xs"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const performDelete = async (id: string) => {
    try {
      await api.delete(`/admin/posts/${id}`); // Assuming generic admin delete endpoint
      toast.success("Post deleted successfully");
      setPosts(prev => prev.filter(p => p._id !== id));
      if (selectedPost?._id === id) setSelectedPost(null);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const dismissReports = async (id: string) => {
    try {
      await api.patch(`/admin/reports/dismiss/${id}`);
      toast.success("Reports dismissed");
      // Instead of removing the post, we just clear its reports locally
      setPosts(prev => prev.map(p => p._id === id ? { ...p, reports: [] } : p));
      if (selectedPost?._id === id) setSelectedPost(prev => prev ? { ...prev, reports: [] } : null);
    } catch {
      toast.error("Failed to dismiss reports");
    }
  };

  // --- FILTER LOGIC ---
  const filteredPosts = posts.filter(post => {
    if (filter === "reported") return post.reports && post.reports.length > 0;
    if (filter === "clean") return !post.reports || post.reports.length === 0;
    return true;
  });

  return (
    <div className="font-sans text-slate-900 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-500 text-sm mt-1">Browse all platform content and moderate flagged items.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <span className="px-3 py-1 text-xs font-bold text-slate-600">Total: {posts.length}</span>
           <span className="h-4 w-px bg-slate-200"></span>
           <span className="px-3 py-1 text-xs font-bold text-rose-600 flex items-center gap-1">
             <AlertTriangle size={12} /> Reported: {posts.filter(p => p.reports?.length > 0).length}
           </span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
        <div className="relative w-full sm:w-64">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <select 
             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer"
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
           >
             <option value="all">Show All Posts</option>
             <option value="reported">Show Reported Only</option>
             <option value="clean">Show Clean Only</option>
           </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Content Preview</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-indigo-500" />
                      <p className="text-sm font-medium">Fetching content feed...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="bg-slate-50 p-4 rounded-full"><FileText size={32} /></div>
                      <p className="text-sm font-medium">No posts found matching filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isReported = post.reports && post.reports.length > 0;
                  return (
                    <tr key={post._id} className={`hover:bg-slate-50/80 transition-colors group ${isReported ? 'bg-rose-50/30' : ''}`}>
                      {/* Image Column */}
                      <td className="px-6 py-4 w-32">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative">
                           {post.imageURL ? (
                             <img src={post.imageURL} className="w-full h-full object-cover" alt="Post" />
                           ) : (
                             <FileText className="text-slate-300" size={24} />
                           )}
                           {isReported && (
                             <div className="absolute top-0 right-0 p-0.5 bg-rose-500 rounded-bl-md shadow-sm">
                               <AlertTriangle size={10} className="text-white" />
                             </div>
                           )}
                        </div>
                      </td>

                      {/* Description Column */}
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-slate-700 font-medium line-clamp-2">{post.description}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {isReported ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                             <AlertTriangle size={12} fill="currentColor" />
                             {post.reports.length} Reports
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                             <CheckCircle size={12} /> Clean
                           </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Details - Shows reports if any, or just post info */}
                          <button 
                            onClick={() => setSelectedPost(post)}
                            className={`p-2 rounded-lg transition-colors ${isReported ? "text-rose-500 hover:bg-rose-100" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {/* Dismiss Reports (Only visible if reported) */}
                          {isReported && (
                            <button
                              onClick={() => dismissReports(post._id)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Dismiss Reports (Keep Post)"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

                          <button 
                            onClick={() => deletePost(post._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Post Details */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${selectedPost.reports?.length > 0 ? "bg-rose-50/50" : "bg-slate-50/50"}`}>
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 {selectedPost.reports?.length > 0 ? (
                    <><AlertTriangle className="text-rose-500" size={20} /> Reported Content</>
                 ) : (
                    <><FileText className="text-slate-500" size={20} /> Post Details</>
                 )}
               </h2>
               <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                 <XCircle size={24} />
               </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
               <div className="flex gap-6 flex-col sm:flex-row">
                  {/* Left: Image */}
                  <div className="sm:w-1/2">
                    {selectedPost.imageURL ? (
                      <img src={selectedPost.imageURL} className="w-full rounded-xl border border-slate-200 shadow-sm" alt="Post content" />
                    ) : (
                      <div className="w-full h-48 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <p className="text-sm text-slate-700 font-medium">"{selectedPost.description}"</p>
                    </div>
                    {selectedPost.user && (
                       <div className="mt-2 text-xs text-slate-400">
                          Posted by: <span className="font-semibold">{selectedPost.user.name}</span>
                       </div>
                    )}
                  </div>

                  {/* Right: Reports or Status */}
                  <div className="sm:w-1/2 flex flex-col">
                    {selectedPost.reports?.length > 0 ? (
                        <>
                           <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">Reported By ({selectedPost.reports.length})</h3>
                           <div className="space-y-3 overflow-y-auto pr-2 flex-1 max-h-64">
                              {selectedPost.reports.map((r, i) => (
                                <div key={i} className="bg-white border border-rose-100 p-3 rounded-lg shadow-sm">
                                   <div className="flex justify-between items-start mb-1">
                                      <span className="text-sm font-bold text-slate-800">{r.userId?.name || "Unknown User"}</span>
                                      <span className="text-[10px] text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-xs text-rose-600 bg-rose-50 inline-block px-2 py-0.5 rounded border border-rose-100 font-medium">
                                     {r.reason}
                                   </p>
                                </div>
                              ))}
                           </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                           <CheckCircle size={32} className="text-emerald-400" />
                           <p className="text-sm">No reports on this post.</p>
                        </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {selectedPost.reports?.length > 0 && (
                  <button 
                    onClick={() => dismissReports(selectedPost._id)}
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    Dismiss Reports
                  </button>
              )}
              <button 
                onClick={() => deletePost(selectedPost._id)}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-rose-200"
              >
                Delete Content
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}