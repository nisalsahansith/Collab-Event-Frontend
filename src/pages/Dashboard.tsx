import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import { unwrapResult } from "@reduxjs/toolkit";
import type { Post } from "../redux/events/eventAction";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [posts, setPosts] = useState<Post[]>([]);

  const goToCreatePost = () => {
    navigate("/create-post");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    const load = async () => {
      try {
        const action = await dispatch(fetchPosts());
        const result = unwrapResult(action);
        setPosts(result);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold text-indigo-600">CollabEvent</div>

        <ul className="flex gap-6 text-gray-700 font-semibold items-center">
          <li className="hover:text-indigo-600 cursor-pointer">Home</li>
          <li className="hover:text-indigo-600 cursor-pointer">Chat</li>
          <li onClick={goToCreatePost} className="hover:text-indigo-600 cursor-pointer">
            Create Post
          </li>
          <li className="hover:text-indigo-600 cursor-pointer">Profile</li>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
          >
            Logout
          </button>
        </ul>
      </nav>

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Posts</h1>

        {/* Loop posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4"
            >
              {/* Post header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={"https://via.placeholder.com/40"}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">Unknown User</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Post text */}
              <p className="text-gray-700 mb-3">{post.description}</p>

              {/* Post image */}
              {post.imageURL && (
                <img
                  src={post.imageURL}
                  className="w-full rounded-xl object-cover max-h-96"
                />
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-5 border-t pt-3 text-gray-600 font-medium">
                <button className="hover:text-blue-600">👍 Like</button>
                <button className="hover:text-blue-600">💬 Comment</button>
                <button className="hover:text-blue-600">↗ Share</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
