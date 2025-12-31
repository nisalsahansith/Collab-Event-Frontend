import { useEffect, useState } from "react";
import api from "../services/api"; // your axios instance
import { toast } from "react-hot-toast";
import { 
  CheckCircle, Trash2, Ban, Filter, 
  AlertTriangle, Clock, FileText, User, 
  Loader2
} from "lucide-react";

// --- INTERFACES ---
interface IReport {
  _id: string; // Unique ID composed of postId_index
  reason: string;
  date: string;
  status: "pending" | "resolved";
  user?: { _id: string; name: string }; // Reporter info
  post?: { 
    _id: string; 
    description: string; 
    imageURL?: string; 
    owner?: string; // ID of the post owner
  };
}

export default function AdminReports() {
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "resolved" | "all">("pending");

  useEffect(() => {
    fetchReports();
  }, []);

  // --- DATA FETCHING ---
  const fetchReports = async () => {
    try {
      setLoading(true);
      // Matches router.get("/reports", ... getReportedPosts) which is prefixed with /admin in index.ts
      const res = await api.get("/admin/reports");
      const posts = res.data; 

      // Flatten nested reports structure: [Post] -> [Report]
      const flatReports: IReport[] = [];
      if (Array.isArray(posts)) {
        posts.forEach((post: any) => {
          if (Array.isArray(post.reports)) {
            post.reports.forEach((r: any, idx: number) => {
              flatReports.push({
                _id: `${post._id}_${idx}`, // Virtual ID for key
                reason: r.reason,
                date: r.date,
                status: r.status || "pending",
                user: r.userId, 
                post: {
                  _id: post._id,
                  description: post.description,
                  imageURL: post.imageURL,
                  owner: post.owner,
                },
              });
            });
          }
        });
      }

      setReports(flatReports);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const resolveReport = async (reportId: string) => {
    const [postId, index] = reportId.split("_");
    const toastId = toast.loading("Resolving...");
    try {
      // Matches router.patch("/reports/dismiss/:id", ... dismissReports)
      // Note: Endpoint is named 'dismiss' but functionally resolves the report status
      await api.patch(`/admin/reports/dismiss/${postId}?index=${index}`);
      
      toast.success("Report marked as resolved", { id: toastId });
      
      // Optimistic update
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: "resolved" } : r));
    } catch {
      toast.error("Failed to resolve report", { id: toastId });
    }
  };

  const deletePost = async (postId: string) => {
    // Custom Confirmation Toast
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="font-semibold text-slate-800 text-sm">Delete this post permanently?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              performDeletePost(postId);
            }}
            className="bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-rose-700"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const performDeletePost = async (postId: string) => {
    const toastId = toast.loading("Deleting post...");
    try {
      // Matches router.delete("/posts/:id", ... deletePostByAdmin)
      await api.delete(`/admin/posts/${postId}`);
      
      toast.success("Post deleted", { id: toastId });
      // Remove all reports associated with this post ID
      setReports(prev => prev.filter(r => r.post?._id !== postId));
    } catch {
      toast.error("Failed to delete post", { id: toastId });
    }
  };

  const banUser = async (userId?: string) => {
    if (!userId) return toast.error("User ID missing");
    
    // Custom Confirmation Toast
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="font-semibold text-slate-800 text-sm">Ban this user immediately?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              performBanUser(userId);
            }}
            className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-amber-700"
          >
            Confirm Ban
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const performBanUser = async (userId: string) => {
    const toastId = toast.loading("Banning user...");
    try {
      // Matches router.patch("/users/:id/toggle-status", ... toggleUserStatus)
      // This toggles status, so ensuring we are banning requires the user to be active initially.
      // Assuming this action is intended to Ban.
      await api.patch(`/admin/users/${userId}/toggle-status`);
      
      toast.success("User status toggled (Banned)", { id: toastId });
    } catch {
      toast.error("Failed to ban user", { id: toastId });
    }
  };

  // --- FILTERING ---
  const filteredReports = reports.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const pendingCount = reports.filter(r => r.status === "pending").length;

  return (
    <div className="font-sans text-slate-900 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review user reports, resolve disputes, and moderate content.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <span className="px-3 py-1 text-xs font-bold text-slate-600">Total: {reports.length}</span>
           <span className="h-4 w-px bg-slate-200"></span>
           <span className="px-3 py-1 text-xs font-bold text-amber-600 flex items-center gap-1">
             <Clock size={12} /> Pending: {pendingCount}
           </span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
        <div className="relative w-full sm:w-64">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <select 
             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer"
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
           >
             <option value="pending">Show Pending</option>
             <option value="resolved">Show Resolved</option>
             <option value="all">Show All Reports</option>
           </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Reported Content</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-indigo-500" />
                      <p className="text-sm font-medium">Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="bg-slate-50 p-4 rounded-full"><CheckCircle size={32} /></div>
                      <p className="text-sm font-medium">No reports found matching this filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Content Column */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          {r.post?.imageURL ? (
                            <img src={r.post.imageURL} className="w-full h-full object-cover" alt="Post" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={20}/></div>
                          )}
                        </div>
                        <div>
                           <p className="text-sm text-slate-800 font-medium line-clamp-2" title={r.post?.description}>
                             {r.post?.description || <span className="text-slate-400 italic">No description</span>}
                           </p>
                           <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <User size={10} /> 
                              <span>Owner ID: {r.post?.owner?.slice(-6) || "Unknown"}</span>
                           </div>
                        </div>
                      </div>
                    </td>

                    {/* Reporter Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                           {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{r.user?.name || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Reason Column */}
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                         <AlertTriangle size={10} /> {r.reason}
                       </span>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(r.date).toLocaleDateString()}
                      <br/>
                      <span className="text-[10px] opacity-70">{new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.status === "pending" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {r.status === "pending" ? "Pending" : "Resolved"}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Resolve Button */}
                        {r.status === "pending" && (
                          <button 
                            onClick={() => resolveReport(r._id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        {/* Ban User Button */}
                        <button 
                          onClick={() => banUser(r.post?.owner)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ban Post Owner"
                        >
                          <Ban size={18} />
                        </button>

                        {/* Delete Post Button */}
                        <button 
                          onClick={() => deletePost(r.post?._id || "")}
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
    </div>
  );
}