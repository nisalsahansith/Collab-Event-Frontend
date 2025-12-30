import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, Activity 
} from "lucide-react";

// Define your menu items in an array to keep the JSX clean
const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/posts", label: "Posts", icon: FileText },
  { path: "/admin/reports", label: "Reports", icon: AlertTriangle }, // We will handle the badge below
  { path: "/admin/analytics", label: "Analytics", icon: Activity },
];

export default function AdminSidebar({ stats }: { stats: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {MENU_ITEMS.map((item) => {
        // Check if the current URL matches the item path
        // using .includes() allows nested routes (e.g., /admin/users/123) to keep "Users" active
        const isActive = location.pathname.includes(item.path);

        return (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={isActive}
            // If it's the Reports tab, pass the badge count
            badge={item.label === "Reports" ? stats.reports : undefined}
            onClick={() => navigate(item.path)}
          />
        );
      })}
    </nav>
  );
}

// Ensure your SidebarItem component accepts these props
function SidebarItem({ icon: Icon, label, active, onClick, badge }: any) {
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