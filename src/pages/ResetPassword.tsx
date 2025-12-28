import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import toast,{Toaster} from "react-hot-toast";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);

  const {state} = useLocation() as any;
  const email = state?.email;
  const navigate = useNavigate();

  const handleReset = async(e:any)=>{
    e.preventDefault();
    if(password.length < 6) return toast.error("Password must be at least 6 characters");

    try{
      setLoading(true);
      await api.post("/auth/reset-password",{ email, newPassword:password });

      toast.success("Password Updated!");
      setTimeout(()=>navigate("/login"),900);

    }catch(err:any){
      toast.error(err.response?.data?.msg || "Error resetting password");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
      <Toaster position="top-center"/>

      <div className="absolute inset-0 bg-cover bg-center opacity-40"
           style={{backgroundImage:"url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')"}}/>

      <div className="relative w-full max-w-md p-6">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl">

          <CheckCircle className="text-green-400 mx-auto mb-3" size={40}/>
          <h2 className="text-3xl text-white font-bold text-center mb-2">Reset Password</h2>

          <form onSubmit={handleReset} className="space-y-5 mt-4">
            <div>
              <label className="text-xs text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400"/>
                <input 
                  type={show ? "text":"password"}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl text-white pl-10 pr-12 py-3"
                  placeholder="********"
                />
                <button type="button" 
                        onClick={()=>setShow(!show)}
                        className="absolute right-3 top-3 text-white">
                  {show? <EyeOff/>:<Eye/>}
                </button>
              </div>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold">
              {loading? <Loader2 className="animate-spin"/> : "Update Password"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
