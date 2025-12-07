import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../redux/events/eventAction";
import type { AppDispatch } from "../redux/store";
import { unwrapResult } from "@reduxjs/toolkit";
import type { Post } from "../redux/events/eventAction";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { logout } from "../context/authContext";
import Footer from "../components/Footer";

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

      <Header handleLogout={logout}/>

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
                  src={
                    post.owner?.image ||
                    "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
                  }
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{post.owner.name || "Unknown User"}</p>
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
                {/* Chat button */}
                  <button
                    className="hover:text-indigo-600 font-semibold"
                    onClick={() =>
                      navigate("/message", {
                        state: {
                          receiverId: post.owner._id,
                          receiverName: post.owner.name,
                          receiverAvatar: post.owner.image,
                        },
                      })
                    }
                  >
                    💬 Chat
                  </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
