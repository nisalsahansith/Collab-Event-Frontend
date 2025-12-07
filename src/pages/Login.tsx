import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login, getMyDetails } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const data: any = await login(email, password);

      if (data?.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("userId",data.data.id)
        const resData: any = await getMyDetails();
        setUser(resData.data);

        navigate("/dashboard");
      } else {
        setError("Login failed, please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed, please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* LOGIN CARD */}
      <div className="relative z-20 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Welcome Back
        </h1>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-center mb-4 font-semibold">{error}</p>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-200 block mb-2 font-semibold">Email</label>
          <input
            type="email"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-indigo-400 outline-none transition"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-gray-200 block mb-2 font-semibold">Password</label>
          <input
            type="password"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-indigo-400 outline-none transition"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Extra Links */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-400 hover:underline font-semibold"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
