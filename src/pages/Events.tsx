import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import { createEvent } from "../redux/events/eventAction";
import type { AsyncThunkAction, Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";

export default function CreatePost() {
  const { logout } = useAuth();

  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  // 📌 Handle Tag Add on Enter
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  // 📌 Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // 📌 Handle Image Upload + Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // 📌 Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("description", description);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // ✅ FIXED TAGS — send correctly to backend
      tags.forEach((tag) => formData.append("tags", tag));

      // Debug Log
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // 🚀 Dispatch still uses tags array – same as before
      await dispatch(
        createEvent({
          description,
          image: imageFile || undefined,
          tags,
        })
      ).unwrap();

      alert("Post created successfully!");
    } catch (err) {
      console.error("Failed to submit post:", err);
      alert("Failed to submit post.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header handleLogout={logout} />

      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8">
          {/* TITLE */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Post</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DESCRIPTION */}
            <div>
              <label className="text-lg font-semibold text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border mt-1 h-40 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe what your event is about..."
              />
            </div>

            {/* TAG SYSTEM */}
            <div>
              <label className="text-lg font-semibold text-gray-700">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="w-full p-3 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="type a tag & press Enter..."
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

            {/* IMAGE UPLOAD */}
            <div>
              <label className="text-lg font-semibold text-gray-700">
                Upload Image
              </label>

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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full py-3 text-white font-semibold text-lg bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg"
            >
              Post Event
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
