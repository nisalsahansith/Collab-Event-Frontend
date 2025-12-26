import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Layout, ShieldCheck, ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-sans selection:bg-indigo-500 selection:text-white">

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col">
        
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80')",
          }}
        >
           <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
        </div>

        {/* NAVBAR - Glassmorphism */}
        <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md transition-all">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white cursor-pointer flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">C</span>
            </div>
            <span>Collab<span className="text-indigo-400">Event</span></span>
          </h1>

          <div className="flex items-center gap-4">
            <a href="/login" className="hidden md:flex text-sm font-medium text-white/80 hover:text-white transition-colors">
              Login
            </a>
            <a 
              href="/signup" 
              className="px-5 py-2 text-sm font-semibold bg-white text-indigo-900 rounded-full hover:bg-indigo-50 transition-all shadow-lg shadow-white/10"
            >
              Sign Up
            </a>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-16">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
              Create Meaningful <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
                Events Together
              </span>
            </h2>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 leading-relaxed font-light">
              A powerful platform to plan, collaborate, and manage events with
              ease. Designed for teams that want clarity, speed, and beautiful
              experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 mb-20">
              <a
                href="/signup"
                className="group w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </a>

              <a
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2"
              >
                Login
              </a>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator (Optional Polish) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/50 rounded-full"></div>
           </div>
        </div>
      </section>

      {/* ABOUT CARDS SECTION */}
      <section className="py-24 px-6 md:px-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-2">
              About This Website
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap size={28} fill="currentColor" className="opacity-80" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Fast & Reliable
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our platform ensures high performance and seamless experience for
                all users.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layout size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Modern UI/UX
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Designed with professional and user-friendly principles with clean
                aesthetics.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Secure & Scalable
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Built with best practices to ensure data security and smooth
                scalability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 md:px-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            
            {/* Column 1 */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                 <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                 Our Platform
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Delivering quality, performance, and modern UI for a seamless
                experience.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">
                Quick Links
              </h4>
              <ul className="space-y-3 text-slate-400">
                {['Home', 'Features', 'Contact'].map((item) => (
                    <li key={item} className="hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                        {item}
                    </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Contact</h4>
              <div className="space-y-3">
                 <p className="flex items-center gap-3 hover:text-white transition-colors">
                    Email: support@example.com
                 </p>
                 <p className="flex items-center gap-3 hover:text-white transition-colors">
                    Phone: +94 77 123 4567
                 </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
            <p>© 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}