import { useEffect, useState } from "react";
import api from "../services/api"; // Ensure this path matches your project structure
import toast, { Toaster } from "react-hot-toast";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, 
  Activity, Settings, LogOut, Search, Bell, 
  Filter, ShieldCheck 
} from "lucide-react";

// --- PAGE IMPORTS ---
// Check that these filenames match exactly what you saved in your /pages folder
import UsersPage from "../pages/UserMAnagement";        // Previously "UserMAnagement"
import PostPage from "../pages/AdminPostPage";     // Previously "AdminPostPage"
import ReportPage from "../pages/AdminReports";    // Previously "AdminReports"
import AdminSettings from "../pages/AdminSettingPage"; // Previously "AdminSettingPage"

// --- TYPES ---
interface Stats {
  users: number;
  posts: number;
  reports: number;
  activeToday: number;
}

interface Report {
  _id: string;
  reason: string;
  status: string;
  date: string;
  user?: { name: string };
  post?: { _id: string };
}

// --- DASHBOARD OVERVIEW COMPONENT ---
function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    posts: 0,
    reports: 0,
    activeToday: 0,
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 
      // Fetching stats and latest reports in parallel
      const [res1, res2] = await Promise.all([
        api.get("/admin/stats"),         // Endpoint for numeric stats
        api.get("/admin/reports/latest") // Endpoint for recent report list
      ]);

      setStats(res1.data || { users: 0, posts: 0, reports: 0, activeToday: 0 });
      setReports(res2.data?.reports || []);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor key metrics and manage reports.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.users.toLocaleString()} 
          icon={Users} 
          color="indigo"
        />
        <StatCard 
          title="Total Posts" 
          value={stats.posts.toLocaleString()} 
          icon={FileText} 
          color="blue"
        />
        <StatCard 
          title="Pending Reports" 
          value={stats.reports.toString()} 
          icon={AlertTriangle} 
          color="rose" 
          isAlert 
        />
        <StatCard 
          title="Active Today" 
          value={stats.activeToday.toLocaleString()} 
          icon={Activity} 
          color="emerald" 
        />
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Recent Reports</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Target Post</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                     No recent reports found.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "?"}
                         </div>
                         <span className="font-medium text-slate-700">{r.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {r.post?._id ? `#${r.post._id.slice(-6)}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-700 font-medium">{r.reason}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge status={r.status || "Pending"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        Review
                      </button>
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

// --- MAIN LAYOUT COMPONENT ---
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Navigation Logic - This switches the main content area
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardOverview />;
      case "Users":
        return <UsersPage />;
      case "Posts":
        return <PostPage />;
      case "Reports":
        return <ReportPage />;
      case "Settings":
        return <AdminSettings />;
      case "Analytics":
        return <div className="text-center p-10 text-slate-500">Analytics Module Coming Soon</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 shadow-xl">
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AdminPanel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === "Dashboard"} 
            onClick={() => setActiveTab("Dashboard")} 
          />
          <SidebarItem 
            icon={Users} 
            label="Users" 
            active={activeTab === "Users"} 
            onClick={() => setActiveTab("Users")} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Posts" 
            active={activeTab === "Posts"} 
            onClick={() => setActiveTab("Posts")} 
          />
          <SidebarItem 
            icon={AlertTriangle} 
            label="Reports" 
            active={activeTab === "Reports"} 
            onClick={() => setActiveTab("Reports")} 
          />
          <SidebarItem 
            icon={Activity} 
            label="Analytics" 
            active={activeTab === "Analytics"} 
            onClick={() => setActiveTab("Analytics")} 
          />
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === "Settings"}
            onClick={() => setActiveTab("Settings")} 
          />
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all duration-200 mt-1 group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="ml-72 w-full flex flex-col min-h-screen">
        
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center shadow-sm">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm" 
              placeholder="Search users, reports, logs..." 
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">Administrator</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
               </div>
               <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                  A
               </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <main className="p-8 flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SidebarItem({ icon: Icon, label, active, badge, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 mb-1 group ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? "text-indigo-200" : "group-hover:text-white transition-colors"} />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-white text-indigo-600" : "bg-rose-500 text-white"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon: Icon, color, isAlert }: any) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
      {isAlert && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-8 -mt-8"></div>}
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${colors[color] || colors.indigo}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h2 className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Dismissed: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}