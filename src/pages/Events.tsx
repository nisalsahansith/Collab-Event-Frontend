import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import { createEvent } from "../redux/events/eventAction";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import toast, { Toaster } from "react-hot-toast";

export default function CreateEventPage() {
  const { logout } = useAuth();

  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  // Add tags on Enter
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Submit Event (updated with toast.promise)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) return toast.error("Description is required!");

    setLoading(true);

    try {
      await toast.promise(
        dispatch(
          createEvent({
            description,
            tags,
            image: imageFile || undefined,
          })
        ).unwrap(),
        {
          loading: "Posting event...",
          success: "Event posted successfully! 🎉",
          error: "Failed to post event ❌",
        }
      );

      // Reset form after successful post
      setDescription("");
      setTags([]);
      setTagsInput("");
      setImageFile(null);
      setPreview(null);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster position="top-right" />

      <Header handleLogout={logout} />

      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Description */}
            <div>
              <label className="text-lg font-semibold text-gray-700">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write about your event..."
                className="w-full p-3 rounded-xl border mt-1 h-40 outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            {/* AI Feature Button */}
            <div>
              <button
                type="button"
                disabled={!description.trim() || loading}
                onClick={() => toast("✨ AI Suggestions Coming Soon")}
                className={`px-4 py-2 rounded-xl text-white mr-2
                ${description.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
              >
                ✨ Use AI Suggestions
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="text-lg font-semibold text-gray-700">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Press Enter to add tag..."
                className="w-full p-3 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((t, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                    #{t}
                    <button type="button" onClick={() => removeTag(i)} disabled={loading} className="ml-2 hover:text-red-600">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-lg font-semibold text-gray-700">Upload Image</label>

              <label className="border-2 border-dashed border-gray-300 rounded-xl h-56 mt-2 flex items-center justify-center cursor-pointer hover:border-indigo-500">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                {preview ? (
                  <img src={preview} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="text-gray-500 text-center">
                    <p className="text-4xl">📸</p>
                    <p>Click or drag file to upload</p>
                  </div>
                )}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-xl transition 
              ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loading ? "Posting..." : "Post Event"}
            </button>
          </form>

        </div>
      </div>

      <Footer />
    </div>
  );
}
