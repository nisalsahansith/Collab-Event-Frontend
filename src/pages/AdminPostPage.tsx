import { useEffect, useState } from "react";
import api from "../services/api"; // your axios instance
import toast from "react-hot-toast";
import { 
  Trash2, Eye, XCircle, Loader2, 
  AlertTriangle, CheckCircle, FileText, Calendar 
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
  reports: Report[];
  createdAt: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- API ACTIONS ---
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reports");
      setPosts(res.data);
    } catch (err) {
      toast.error("Failed to load reported posts");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success("Post deleted successfully");
      // Remove from local state immediately to avoid reload
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
      // Remove from local state since it's no longer a "reported" post
      setPosts(prev => prev.filter(p => p._id !== id));
      if (selectedPost?._id === id) setSelectedPost(null);
    } catch {
      toast.error("Failed to dismiss reports");
    }
  };

  return (
    <div className="font-sans text-slate-900 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Moderation</h1>
          <p className="text-slate-500 text-sm mt-1">Review flagged content and manage community standards.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <span className="px-3 py-1 text-xs font-bold text-slate-600">Pending Review</span>
           <span className="h-4 w-px bg-slate-200"></span>
           <span className="px-3 py-1 text-xs font-bold text-rose-600 flex items-center gap-1">
             <AlertTriangle size={12} /> {posts.length}
           </span>
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
                <th className="px-6 py-4 text-center">Severity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-indigo-500" />
                      <p className="text-sm font-medium">Fetching reports...</p>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="bg-slate-50 p-4 rounded-full"><CheckCircle size={32} /></div>
                      <p className="text-sm font-medium">No reported content found. All clear!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Image Column */}
                    <td className="px-6 py-4 w-32">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                         {post.imageURL ? (
                           <img src={post.imageURL} className="w-full h-full object-cover" alt="Post" />
                         ) : (
                           <FileText className="text-slate-300" size={24} />
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

                    {/* Report Count Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${post.reports.length > 2 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        <AlertTriangle size={12} fill="currentColor" />
                        {post.reports.length} Reports
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedPost(post)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <button
                          onClick={() => dismissReports(post._id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Dismiss Reports (Keep Post)"
                        >
                          <CheckCircle size={18} />
                        </button>

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
                ))
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
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <AlertTriangle className="text-rose-500" size={20} /> Report Details
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
                      <img src={selectedPost.imageURL} className="w-full rounded-xl border border-slate-200 shadow-sm" alt="Reported content" />
                    ) : (
                      <div className="w-full h-48 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <p className="text-sm text-slate-700 font-medium">"{selectedPost.description}"</p>
                    </div>
                  </div>

                  {/* Right: Reports List */}
                  <div className="sm:w-1/2 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Reported By ({selectedPost.reports.length})</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1 max-h-64">
                       {selectedPost.reports.map((r, i) => (
                         <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
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
                  </div>
               </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => dismissReports(selectedPost._id)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Dismiss & Keep
              </button>
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