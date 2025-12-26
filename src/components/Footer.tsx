import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const LinkItem = ({ label, path }: { label: string, path?: string }) => (
    <li 
      onClick={() => path && navigate(path)}
      className="hover:text-indigo-400 cursor-pointer transition-colors duration-200"
    >
      {label}
    </li>
  );

  const SocialIcon = ({ icon: Icon }: { icon: any }) => (
    <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-200 group">
      <Icon size={18} className="text-slate-400 group-hover:text-white" />
    </a>
  );

  return (
    <footer className="bg-slate-950 text-slate-400 py-10 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Brand & Tagline */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div className="bg-indigo-600 text-white p-1 rounded-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">CollabEvent</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-xs mx-auto md:mx-0">
            Connecting creators, developers, and visionaries through the power of collaboration.
          </p>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium">
          <LinkItem label="Home" path="/dashboard" />
          <LinkItem label="Events" path="/dashboard" />
          <LinkItem label="Chat" path="/message" />
          <LinkItem label="Profile" path="/myprofile" />
          <LinkItem label="About Us" />
        </ul>

        {/* Socials & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-3">
            <SocialIcon icon={Twitter} />
            <SocialIcon icon={Github} />
            <SocialIcon icon={Linkedin} />
            <SocialIcon icon={Instagram} />
          </div>
          <div className="text-slate-600 text-xs">
            © {new Date().getFullYear()} CollabEvent. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}