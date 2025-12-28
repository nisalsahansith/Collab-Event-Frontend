import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

 const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
        toast.error("Enter your email.");
        return;
    }

    try {
        setLoading(true);
        const res = await api.post("/auth/forgot-password", { email });

        toast.success(res.data.msg || "OTP sent to your email!");

        // Navigate to verify OTP page with email in state
        navigate("/verify-otp", { state: { email } });

    } catch (err: any) {
        toast.error(err.response?.data?.msg || "Something went wrong");
    } finally {
        setLoading(false);
    }
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      <Toaster position="top-center" />

      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')" }}
      />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-white text-center mb-2">Forgot Password</h2>
          <p className="text-slate-300 text-center mb-6 text-sm">Enter your email to receive OTP</p>

          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="text-xs text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  className="w-full bg-black/20 border border-white/20 rounded-xl text-white pl-10 pr-3 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="john@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <>Send OTP <ArrowRight size={18}/></>}
            </button>
          </form>

          <p className="text-center text-slate-300 text-sm mt-6">
            Go back? <Link to="/login" className="text-indigo-400 font-semibold hover:underline">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
