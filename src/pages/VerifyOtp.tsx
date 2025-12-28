import { useState } from "react";
import { KeyRound, ArrowRight, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { state } = useLocation() as any;
  const email = state?.email;
  const navigate = useNavigate();

  const handleVerify = async (e:any) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter valid OTP");

    try {
      setLoading(true);
      await api.post("/auth/verify-otp", { email, otp });

      toast.success("OTP Verified!");
      setTimeout(() => navigate("/reset-password", {state:{email}}), 900);

    } catch (err:any) {
      toast.error(err.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      <Toaster position="top-center"/>

      <div className="absolute inset-0 bg-cover bg-center opacity-40"
           style={{backgroundImage:"url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')"}}/>

      <div className="relative w-full max-w-md p-6">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl">

          <h2 className="text-3xl font-bold text-white text-center">Verify OTP</h2>
          <p className="text-slate-300 text-sm text-center mb-6">Enter the OTP sent to {email}</p>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-xs text-slate-300">OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-slate-400"/>
                <input 
                  type="text"
                  value={otp}
                  onChange={(e)=>setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full bg-black/20 border border-white/20 rounded-xl text-white pl-10 pr-3 py-3 tracking-widest text-center text-xl"
                  placeholder="123456"
                />
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl flex justify-center items-center gap-2 font-semibold">
              {loading ? <Loader2 className="animate-spin"/> : <>Verify <ArrowRight /></>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
