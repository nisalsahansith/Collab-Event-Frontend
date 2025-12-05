import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import { useAuth } from "../context/authContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignup = async () => {
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const data: any = await register(form.name, form.email, form.password);

      if (data?.message === "User registed") {
        navigate("/login");
      } else {
        setError("Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed.");
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
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-20 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Create Account
        </h1>

        {/* Error UI */}
        {error && (
          <p className="text-red-400 text-center mb-4 font-semibold">{error}</p>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="text-gray-200 block mb-2 font-semibold">Name</label>
          <input
            type="text"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-indigo-400 outline-none transition"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-200 block mb-2 font-semibold">Email</label>
          <input
            type="email"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-indigo-400 outline-none transition"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-gray-200 block mb-2 font-semibold">
            Password
          </label>
          <input
            type="password"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-indigo-400 outline-none transition"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-400 hover:underline font-semibold"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
