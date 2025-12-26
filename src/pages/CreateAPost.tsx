import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import { useDispatch } from "react-redux";
import { createEvent } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import api from "../services/api";
import toast from "react-hot-toast";

export default function CreatePost() {
  const { logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  //================ TAGS =================//
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };
  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index));

  //================ IMAGE =================//
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  //================ AI FEATURES =================//
  const generateDescription = async () => {
    if (!description.trim()) return toast.error("Type something for AI 🤖");
    try {
      setLoadingAI(true);
      const res = await api.post("/post/ai/description", { prompt: description });
      setDescription(res.data.description);
      toast.success("AI Updated Description ✨");
    } catch {
      toast.error("AI failed ❌");
    } finally {
      setLoadingAI(false);
    }
  };

  const generateTags = async () => {
    if (!description.trim()) return toast.error("Write description first!");
    try {
      setLoadingAI(true);
      const res = await api.post("/post/ai/tags", { text: description });
      setTags(res.data.tags);
      toast.success("Tags Generated 💡");
    } catch {
      toast.error("AI failed ❌");
    } finally {
      setLoadingAI(false);
    }
  };

  const generateImageAI = async () => {
    try {
      setLoadingAI(true);
      const res = await api.post("/post/ai/image", {
        prompt: description || "beautiful event banner"
      });
      setPreview(res.data.image);
      setImageFile(null);
      toast.success("Image Generated 🖼️");
    } catch {
      toast.error("AI failed ❌");
    } finally {
      setLoadingAI(false);
    }
  };

  //================ SUBMIT =================//
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Description required!");

    setLoadingPost(true);

    try {
      await toast.promise(
        dispatch(createEvent({
          description,
          tags,
          image: imageFile ?? undefined
        })).unwrap(),
        {
          loading: "Posting event...",
          success: "Post created 🎉",
          error: "Failed to create post ❌"
        }
      );

      // Reset form after success
      setDescription("");
      setImageFile(null);
      setPreview(null);
      setTags([]);
      setTagsInput("");

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPost(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header handleLogout={logout} />

      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Post</h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* DESCRIPTION */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold">Description</label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={loadingAI}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingAI ? "Generating..." : "✨ AI Write"}
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event..."
                className="w-full p-3 rounded-xl border mt-2 h-40 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* TAGS */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold">Tags</label>
                <button
                  type="button"
                  onClick={generateTags}
                  disabled={loadingAI}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingAI ? "Generating..." : "✨ AI Tags"}
                </button>
              </div>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag & press Enter..."
                className="w-full p-3 rounded-xl border mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap gap-3 mt-3">
                {tags.map((t, i) => (
                  <div key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                    #{t}
                    <button onClick={() => removeTag(i)} className="ml-2 hover:text-red-600">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold">Upload Image</label>
                <button
                  type="button"
                  onClick={generateImageAI}
                  disabled={loadingAI}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingAI ? "Generating..." : "✨ AI Image"}
                </button>
              </div>

              <label className="border-2 border-dashed border-gray-300 rounded-xl h-56 mt-2 flex items-center justify-center cursor-pointer hover:border-indigo-500">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                
                {!preview ? (
                  <div className="text-center text-gray-500">
                    <p className="text-4xl">📸</p>
                    <p>Click or drag file to upload</p>
                  </div>
                ) : (
                  <img src={preview} className="h-full w-full object-cover rounded-xl" />
                )}
              </label>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loadingPost}
              className={`w-full py-3 text-white font-semibold rounded-xl 
              ${loadingPost ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loadingPost ? "Posting..." : "Post Event"}
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
