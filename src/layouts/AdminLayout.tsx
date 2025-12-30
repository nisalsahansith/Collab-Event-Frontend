import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, 
  Activity, Settings, LogOut, Search, Bell, ShieldCheck 
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items for easy management
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Posts", path: "/admin/posts", icon: FileText },
    { label: "Reports", path: "/admin/reports", icon: AlertTriangle },
    { label: "Analytics", path: "/admin/analytics", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR (Fixed) */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 shadow-xl transition-all">
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AdminPanel</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 mb-1 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-indigo-200" : "group-hover:text-white transition-colors"} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
             <Settings size={18} /> <span className="font-medium text-sm">Settings</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all mt-1">
             <LogOut size={18} /> <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="ml-72 w-full flex flex-col min-h-screen">
        
        {/* TOPBAR (Sticky) */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center shadow-sm">
          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm" 
              placeholder="Search users, reports, logs..." 
            />
          </div>

          {/* User Profile */}
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

        {/* PAGE CONTENT (Dynamic) */}
        <main className="p-8 flex-1 overflow-y-auto">
           <Outlet /> 
        </main>

      </div>
    </div>
  );
}