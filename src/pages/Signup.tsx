import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, UserPlus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
    }

    try {
      setLoading(true);
      const data: any = await register(form.name, form.email, form.password);

      if (data?.message === "User registed") {
        toast.success("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans">
      <Toaster position="top-center" toastOptions={{ className: 'font-medium text-sm' }}/>

      {/* BACKGROUND IMAGE & OVERLAY */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px]"></div>
      </div>

      {/* SIGNUP CARD */}
      <div className="relative z-10 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-600/30">
              <UserPlus size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-300 mt-2 text-sm">Join our community today.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            
            {/* Name Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/30 transition-all sm:text-sm"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/30 transition-all sm:text-sm"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="block w-full pl-11 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/30 transition-all sm:text-sm"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Signup Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                        Create Account <ArrowRight size={18} />
                    </>
                )}
            </button>
          </form>

          {/* Footer / Login Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-300 text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-bold text-white hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group"
              >
                Log In 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}