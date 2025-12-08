import React, { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ================= TYPES ================= */
interface User {
  _id: string;
  name: string;
  image?: string;
}

interface Post {
  _id: string;
  description: string;
  tags: string[];
  imageURL?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
}

/* ================= CONST ================= */
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=6366f1&color=fff&size=128";

/* ================= COMPONENT ================= */
export default function ProfilePage() {
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false); // loading state

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data.data));

    api.get(`/post/user/${userId}`).then((res) => {
      const postsArray = Array.isArray(res.data.posts)
        ? res.data.posts
        : Array.isArray(res.data)
        ? res.data
        : [];
      setPosts(postsArray);
    });
  }, [userId]);

  /* ================= DELETE POST ================= */
  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/post/delete/${postId}`);
      setPosts((p) => p.filter((x) => x._id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  /* ================= OPEN EDIT ================= */
  const openEdit = (post: Post) => {
    setEditingPost(post);
    setDesc(post.description || "");
    setTags(post.tags || []);
    setPreview(post.imageURL || null);
    setTagsInput("");
    setImageFile(null);
    setMenuPostId(null); // close menu when editing
  };

  /* ================= TAGS ================= */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setTags([...tags, tagsInput.trim()]);
      }
      setTagsInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  /* ================= IMAGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE POST ================= */
  const handleUpdate = async () => {
    if (!editingPost) return;
    setUpdating(true);

    const fd = new FormData();
    fd.append("description", desc);
    fd.append("tags", tags.join(","));
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await api.put(`/post/update/${editingPost._id}`, fd, {
        timeout: 10000, // 10s timeout
      });

      const postsRes = await api.get(`/post/user/${userId}`);
        setPosts(postsRes.data.posts || postsRes.data || []);

        setEditingPost(null);
        setPreview(null);
        setImageFile(null);
        setTags([]);
        setTagsInput("");
        
    } catch (err) {
      console.error(err);
      alert("Failed to update post.");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Header handleLogout={() => {}} />

      <main className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4">

          {/* PROFILE HEADER */}
          {user && (
            <div className="bg-white shadow rounded-xl p-6 mb-8 flex items-center gap-6">
              <img
                src={user.image || DEFAULT_AVATAR}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-semibold">{user.name}</h1>
                <p className="text-gray-500">Your posts & activity</p>
              </div>
            </div>
          )}

          {/* POSTS */}
          <div className="grid md:grid-cols-2 gap-6">
            {posts?.map((post) => (
              <div key={post._id} className="bg-white shadow rounded-xl overflow-hidden">

                {post.imageURL && (
                  <img src={post.imageURL} className="h-60 w-full object-cover" />
                )}

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toDateString()}
                    </span>

                    {/* MENU */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuPostId(menuPostId === post._id ? null : post._id)
                        }
                        className="text-xl text-gray-500"
                      >
                        ⋯
                      </button>

                      {menuPostId === post._id && (
                        <div className="absolute right-0 mt-2 bg-white border shadow rounded w-32 z-20">
                          <button
                            onClick={() => openEdit(post)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(post._id)}
                            className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-3">{post.description}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-6 mt-4 text-gray-600">
                    <button className="flex items-center gap-2 hover:text-indigo-600">
                      ❤️ <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-indigo-600">
                      💬 <span>{post.comments || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="text-center text-gray-500 mt-20">No posts yet</p>
          )}
        </div>
      </main>

      {/* EDIT POPUP */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Update Post</h2>

            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full h-32 border rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={updating}
            />

            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type tag & press Enter"
              className="w-full p-3 border rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={updating}
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <div
                  key={tag}
                  className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 hover:text-red-500"
                    disabled={updating}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <label className="block mb-4 cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={updating}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-56 flex items-center justify-center hover:border-indigo-400 transition">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <p className="text-gray-500">Click to upload image</p>
                )}
              </div>
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="px-5 py-2 border rounded-xl hover:bg-gray-100"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className={`px-5 py-2 text-white rounded-xl ${
                  updating ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
