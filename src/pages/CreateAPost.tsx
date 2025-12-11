import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import { useDispatch } from "react-redux";
import { createEvent } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import api from "../services/api"; // <-- you must have axios instance

export default function CreatePost() {
  const { logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loadingAI, setLoadingAI] = useState(false);

  // TAG ADD
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  // REMOVE TAG
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // IMAGE UPLOAD PREVIEW
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  //----------------------------------------
  // ⭐ AI — Generate Description
  //----------------------------------------
  const generateDescription = async () => {
    try {
      setLoadingAI(true);
      const res = await api.post("/post/ai/description", {
        prompt: description || "Write a creative event description"
      });
      setDescription(res.data.description);
    } catch (e) {
      console.error(e);
      alert("AI failed to generate description");
    } finally {
      setLoadingAI(false);
    }
  };

  //----------------------------------------
  // ⭐ AI — Suggest Tags
  //----------------------------------------
  const generateTags = async () => {
    if (!description.trim()) return alert("Write description first");

    try {
      setLoadingAI(true);
      const res = await api.post("/post/ai/tags", {
        text: description
      });
      setTags(res.data.tags);
    } catch (e) {
      console.error(e);
      alert("AI failed to generate tags");
    } finally {
      setLoadingAI(false);
    }
  };

  //----------------------------------------
  // ⭐ AI — Generate Image
  //----------------------------------------
  const generateImageAI = async () => {
  try {
    setLoadingAI(true);
    const res = await api.post("/post/ai/image", {
      prompt: description || "beautiful event banner"
    });

    // Use the correct property name from backend response
    setPreview(res.data.image); 
    setImageFile(null); // AI image is a base64 URL
  } catch (e) {
    console.error(e);
    alert("AI failed to generate image");
  } finally {
    setLoadingAI(false);
  }
};

  //----------------------------------------
  // SUBMIT
  //----------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!description.trim()) return alert("Description is required!");

    try {
      await dispatch(
        createEvent({
          description,
          image: imageFile || preview, // AI URL also accepted
          tags
        })
      ).unwrap();

      alert("Post created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
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
                <label className="text-lg font-semibold text-gray-700">
                  Description
                </label>

                {/* AI BUTTON */}
                <button
                  type="button"
                  onClick={generateDescription}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✨ AI Write
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border mt-1 h-40 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your event..."
              />
            </div>

            {/* TAGS */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">Tags</label>

                {/* AI BUTTON */}
                <button
                  type="button"
                  onClick={generateTags}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✨ AI Tags
                </button>
              </div>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="w-full p-3 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type tag & press Enter..."
              />

              <div className="flex flex-wrap gap-3 mt-3">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full shadow-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-indigo-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">
                  Upload Image
                </label>

                {/* AI BUTTON */}
                <button
                  type="button"
                  onClick={generateImageAI}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✨ AI Image
                </button>
              </div>

              <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-56 cursor-pointer hover:border-indigo-400 transition">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {!preview ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <span className="text-4xl mb-2">📸</span>
                    <p>Click to upload or drag and drop</p>
                    <p className="text-sm mt-1">PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-xl"
                  />
                )}
              </label>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loadingAI}
              className="w-full py-3 text-white font-semibold text-lg bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg"
            >
              {loadingAI ? "AI is working..." : "Post Event"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
