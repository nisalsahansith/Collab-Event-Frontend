import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login, getMyDetails } from "../services/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, LogIn } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const data: any = await login(email, password);

      if (data?.data?.accessToken) {
        // Store tokens
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("userId", data.data.id);
    
        // Get full user details
        const resData: any = await getMyDetails();
        console.log(resData)
        setUser(resData.data);

        // Check if user is banned
        if (resData.data.banned || resData.data.status === "banned") {
          toast.error("Your account is suspended. Please contact support.");
          // Optional: clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          return; // Stop login flow
        }

        // Redirect based on role
        if (data.data.roles[0] === "ADMIN" || data.data.roles[0] === 'admin') {
          toast.success("Welcome back! 🚀");
          setTimeout(() => navigate("/admin-dashboard"), 800);
        } else if (data.data.roles[0] === "USER" || data.data.roles[0] === 'user') {
          toast.success("Welcome back! 🚀");
          setTimeout(() => navigate("/dashboard"), 800);
        }

      } else {
        toast.error("Invalid credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
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

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-600/30">
              <LogIn size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-300 mt-2 text-sm">Enter your credentials to access your account.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-black/30 transition-all sm:text-sm"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                    <a href="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

            {/* Login Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                        Sign In <ArrowRight size={18} />
                    </>
                )}
            </button>
          </form>

          {/* Footer / Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-300 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-bold text-white hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group"
              >
                Sign Up 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}