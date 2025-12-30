import { useEffect, useState } from "react";
import api from "../services/api"; // your axios instance
import { toast } from "react-hot-toast";
import { 
  Search, Filter, MoreVertical, Trash2, 
  Ban, CheckCircle, Eye, Shield, ShieldAlert,
  Loader2, User as UserIcon
} from "lucide-react";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  status?: string;
  image?: string;
  imageURL?: string; // Handling both potential property names
}

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      // Safe access in case response structure varies
      const data = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (id: string, banned: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-ban`);
      toast.success(banned ? "User Access Restored" : "User Suspended");
      // Optimistic update or refetch
      setUsers(users.map(u => u._id === id ? { ...u, banned: !banned } : u));
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user permanently? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User account deleted");
      setUsers(users.filter(u => u._id !== id));
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users
    ?.filter((u) =>
      (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(search.toLowerCase())
    )
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "active") return !u.banned;
      if (filter === "banned") return u.banned;
      if (filter === "admin") return u.role === "admin";
      return true;
    }) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 sm:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage accounts, roles, and access permissions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <span className="px-3 py-1 text-xs font-bold text-slate-600">Total: {users.length}</span>
           <span className="h-4 w-px bg-slate-200"></span>
           <span className="px-3 py-1 text-xs font-bold text-emerald-600">Active: {users.filter(u => !u.banned).length}</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active Accounts</option>
              <option value="banned">Banned Accounts</option>
              <option value="admin">Administrators</option>
            </select>
            {/* Custom chevron for select */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-indigo-500" />
                      <p className="text-sm font-medium">Loading user database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="bg-slate-50 p-4 rounded-full">
                         <UserIcon size={32} />
                      </div>
                      <p className="text-sm font-medium">No users found matching your criteria.</p>
                      <button 
                        onClick={() => {setSearch(''); setFilter('all');}} 
                        className="text-indigo-600 text-sm font-semibold hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* User Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={u.imageURL || u.image || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          alt={u.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                               <Shield size={12} fill="currentColor" /> Admin
                            </span>
                         ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                               User
                            </span>
                         )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          u.banned
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {u.banned ? (
                           <><ShieldAlert size={12}/> Banned</>
                        ) : (
                           <><CheckCircle size={12}/> Active</>
                        )}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        
                        <button 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                        >
                           <Eye size={18} />
                        </button>

                        <button
                          className={`p-2 rounded-lg transition-colors ${
                             u.banned 
                                ? "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" 
                                : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                          }`}
                          onClick={() => handleBanToggle(u._id, u.banned)}
                          title={u.banned ? "Unban User" : "Ban User"}
                        >
                          {u.banned ? <CheckCircle size={18} /> : <Ban size={18} />}
                        </button>

                        <button
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => deleteUser(u._id)}
                          title="Delete User"
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
        
        {/* Pagination Footer (Static for now, but good for UI completeness) */}
        {!loading && filteredUsers.length > 0 && (
           <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
              <p>Showing all {filteredUsers.length} results</p>
              <div className="flex gap-2">
                 <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                 <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}