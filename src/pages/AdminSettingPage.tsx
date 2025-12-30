import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { User, Lock, Camera, Save, Loader2, ShieldCheck, Mail } from "lucide-react";
import toast from "react-hot-toast";

/* ================= TYPES ================= */
interface AdminData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff";

export default function AdminSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin] = useState<AdminData | null>(null);

  /* ===== PROFILE STATE ===== */
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  /* ===== PASSWORD STATE ===== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        // 
        const res = await api.get("/auth/me"); // Reusing your auth endpoint
        const data = res.data.data;
        setAdmin(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        toast.error("Failed to load admin profile");
      }
    };
    loadData();
  }, []);

  /* ================= HANDLERS ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) return toast.error("Name is required");

    setUpdatingProfile(true);
    const fd = new FormData();
    fd.append("name", name);
    if (imageFile) fd.append("image", imageFile);

    try {
      // Using the endpoints provided in your reference code
      const res = await api.put("/users/update-profile", fd);
      setAdmin(res.data.data);
      toast.success("Admin profile updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error("Fill all password fields");
    if (newPassword.length < 6) return toast.error("Password must be 6+ chars");

    setChangingPassword(true);
    try {
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated securely");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="font-sans text-slate-900 animate-fade-in max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your administrative profile and system security.</p>
      </div>

      <div className="space-y-6">
        
        {/* ===== PROFILE SETTINGS CARD ===== */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
              <p className="text-xs text-slate-500">Public display details</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Image Uploader */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 rounded-full cursor-pointer group overflow-hidden border-4 border-slate-100 shadow-sm"
                >
                  <img
                    src={preview || admin?.image || DEFAULT_AVATAR}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    alt="Admin Profile"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="text-white" size={28} />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={updatingProfile}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Change Photo
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 w-full space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
                    disabled={updatingProfile}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updatingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95 text-sm"
                  >
                    {updatingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {updatingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ===== PASSWORD SETTINGS CARD ===== */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Security</h2>
                <p className="text-xs text-slate-500">Secure your admin account</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
                      disabled={changingPassword}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
                      disabled={changingPassword}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-50 pt-5">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  {changingPassword ? <Loader2 size={16} className="animate-spin" /> : null}
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
}