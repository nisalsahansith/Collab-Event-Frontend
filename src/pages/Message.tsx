import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

interface Message {
  _id?: string;
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
}

const SOCKET_URL = "http://localhost:5000";

export default function ChatPage() {
  const location = useLocation();
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem("userId");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Handle navigation from post
  useEffect(() => {
    const state = location.state as
      | {
          receiverId: string;
          receiverName: string;
          receiverAvatar?: string;
        }
      | null;

    if (state) {
      const existingChat = users.find((u) => u.id === state.receiverId);

      const newUser: ChatUser = {
        id: state.receiverId,
        name: state.receiverName,
        avatar:
          state.receiverAvatar ||
          "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
        lastMessage: "",
      };

      if (existingChat) {
        setSelectedUser(existingChat);
        loadMessages(existingChat.id);
      } else {
        setUsers((prev) => {
          const isAlreadyInList = prev.some((u) => u.id === newUser.id);
          if (isAlreadyInList) return prev;
          return [newUser, ...prev];
        });
        setSelectedUser(newUser);
        setMessages([]); // clear message area
      }
    }
  }, [location.state, users]);
    
  // Load chat users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/messages/chats");
        if (!Array.isArray(res.data)) return;

        const formatted: ChatUser[] = res.data.map((u: any) => ({
          id: u._id,
          name: u.name,
          avatar:
            u.image ||
            "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
          lastMessage: u.lastMessage || "",
        }));

        setUsers(formatted);
        if (!selectedUser && formatted.length) {
          setSelectedUser(formatted[0]);
          loadMessages(formatted[0].id);
        }
      } catch (err) {
        console.error("Failed to load chat users", err);
      }
    };
    loadUsers();
  }, []);

  // Load messages between users
  const loadMessages = async (otherUserId: string) => {
    if (!currentUserId) return;
    try {
      const res = await api.get(`/messages/${currentUserId}/${otherUserId}`);
      const formatted = res.data.map((m: any) => ({
        id: m._id || Date.now().toString(),
        senderId: m.sender,
        receiverId: m.receiver,
        text: m.text,
        timestamp: m.timestamp || new Date().toISOString(),
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("joinRoom", currentUserId);

    socketRef.current.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => socketRef.current?.disconnect();
  }, [currentUserId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!input.trim() || !selectedUser || !currentUserId) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      text: input,
      timestamp: new Date().toISOString(),
    };

    socketRef.current?.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header handleLogout={() => {}} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 border-r overflow-y-auto">
          <h2 className="p-4 font-bold">Chats</h2>
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                loadMessages(u.id);
              }}
              className={`flex items-center gap-3 p-4 cursor-pointer ${
                selectedUser?.id === u.id ? "bg-gray-200" : ""
              }`}
            >
              <img src={u.avatar} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser && (
            <div className="p-4 border-b flex items-center gap-3">
              <img src={selectedUser.avatar} className="w-10 h-10 rounded-full" />
              <h3 className="font-semibold">{selectedUser.name}</h3>
            </div>
          )}

          {/* Messages scrollable box */}
          <div className="flex-1 flex flex-col p-4 bg-gray-50 overflow-y-auto">
            <div className="flex-1">
              {messages.map((m) => {
                const isSender = m.senderId === currentUserId;
                const date = new Date(m.timestamp);
                const time = !isNaN(date.getTime())
                  ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <div
                    key={m.id}
                    className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-xl shadow ${
                        isSender ? "bg-indigo-600 text-white" : "bg-white"
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">{time}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input fixed at bottom */}
            <div className="mt-auto flex gap-2 pt-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-full px-4 py-2"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSend}
                className="bg-indigo-600 text-white px-4 rounded-full"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
