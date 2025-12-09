import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

/* ================= TYPES ================= */
interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

/* ================= CONST ================= */
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=6366f1&color=fff&size=128";

/* ================= COMPONENT ================= */
export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  /* ===== PROFILE ===== */
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  /* ===== PASSWORD ===== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    api.get("/auth/me").then((res) => {
      setUser(res.data.data);
      setName(res.data.data.name);
    });
  }, []);

  /* ================= IMAGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async () => {
    if (!name.trim()) return alert("Name is required");

    setUpdatingProfile(true);
    const fd = new FormData();
    fd.append("name", name);
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await api.put("/users/update-profile", fd);
      setUser(res.data.data);
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword)
      return alert("All fields are required");

    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters");

    setChangingPassword(true);
    try {
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      alert("Password changed successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Header handleLogout={() => {}} />

      <main className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-8">

          {/* ===== TITLE ===== */}
          <h1 className="text-3xl font-bold">Settings</h1>

          {/* ===== PROFILE SETTINGS ===== */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>

            <div className="flex items-center gap-6 mb-6">
              <img
                src={preview || user?.image || DEFAULT_AVATAR}
                className="w-24 h-24 rounded-full object-cover"
              />

              <label className="cursor-pointer text-indigo-600 font-medium">
                Change photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={updatingProfile}
                />
              </label>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 border rounded-xl"
                disabled={updatingProfile}
              />

              <button
                onClick={handleUpdateProfile}
                disabled={updatingProfile}
                className={`px-6 py-2 rounded-xl text-white ${
                  updatingProfile
                    ? "bg-gray-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {updatingProfile ? "Updating..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* ===== PASSWORD SETTINGS ===== */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border rounded-xl"
                disabled={changingPassword}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-xl"
                disabled={changingPassword}
              />

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className={`px-6 py-2 rounded-xl text-white ${
                  changingPassword
                    ? "bg-gray-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {changingPassword ? "Updating..." : "Change password"}
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
