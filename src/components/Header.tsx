import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Plus, MessageCircle, User, Settings, Home, Bell } from "lucide-react";

interface HeaderProps {
  handleLogout: () => void;
}

export default function Header({ handleLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <li
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 cursor-pointer transition-all duration-200 px-3 py-2 rounded-lg font-medium text-sm
        ${isActive(path) 
          ? "text-indigo-600 bg-indigo-50" 
          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
        }`}
    >
      <Icon size={18} />
      <span className="hidden md:inline">{label}</span>
    </li>
  );

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        
        {/* Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
            CollabEvent
          </span>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-1 sm:gap-4">
            <NavItem path="/dashboard" icon={Home} label="Home" />
            <NavItem path="/message" icon={MessageCircle} label="Chat" />
            <NavItem path="/myprofile" icon={User} label="Profile" />
            <NavItem path="/setting" icon={Settings} label="Settings" />
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Create Post Button (Primary Action) */}
          <button
            onClick={() => navigate("/create-post")}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Post Event</span>
          </button>
          
          {/* Mobile Create Button (Icon Only) */}
          <button
            onClick={() => navigate("/create-post")}
            className="sm:hidden flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white w-9 h-9 rounded-full transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          {/* Notifications (Visual only) */}
          <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors relative">
             <Bell size={20} />
             <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-full transition-all text-sm font-medium"
            title="Logout"
          >
            <LogOut size={20} />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}