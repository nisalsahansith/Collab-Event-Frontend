import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";
import { Send, Search, MoreVertical, Image as ImageIcon, Smile, MessageCircle, X } from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"; // Import Emoji Picker

interface Message {
  _id?: string;
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string; // Added image support to interface
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
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const currentUserId = localStorage.getItem("userId");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // UI States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ... (Keep existing useEffects for location, loading users, and loading messages) ...

  /* --- EXISTING USE EFFECTS (Collapse for brevity in your code, keeping logic same) --- */
  useEffect(() => {
    const state = location.state as { receiverId: string; receiverName: string; receiverAvatar?: string; } | null;
    if (state) {
        // ... (Keep existing logic)
        const existingChat = users.find((u) => u.id === state.receiverId);
        const newUser: ChatUser = {
            id: state.receiverId,
            name: state.receiverName,
            avatar: state.receiverAvatar || "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png",
            lastMessage: "",
        };
        if (existingChat) { setSelectedUser(existingChat); loadMessages(existingChat.id); } 
        else { setUsers(prev => { if (prev.some(u => u.id === newUser.id)) return prev; return [newUser, ...prev]; }); setSelectedUser(newUser); setMessages([]); }
    }
  }, [location.state, users]);

  useEffect(() => {
    const loadUsers = async () => {
        // ... (Keep existing logic)
        try {
            const res = await api.get("/messages/chats");
            if (!Array.isArray(res.data)) return;
            const formatted: ChatUser[] = res.data.map((u: any) => ({
                id: u._id, name: u.name, avatar: u.image || "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png", lastMessage: u.lastMessage || "",
            }));
            setUsers(formatted);
            if (!selectedUser && formatted.length) { setSelectedUser(formatted[0]); loadMessages(formatted[0].id); }
        } catch (err) { console.error(err); }
    };
    loadUsers();
  }, []);

  const loadMessages = async (otherUserId: string) => {
      // ... (Keep existing logic)
      if (!currentUserId) return;
      try {
        const res = await api.get(`/messages/${currentUserId}/${otherUserId}`);
        const formatted = res.data.map((m: any) => ({
          id: m._id || Date.now().toString(), senderId: m.sender, receiverId: m.receiver, text: m.text, image: m.image, timestamp: m.timestamp || new Date().toISOString(),
        }));
        setMessages(formatted);
      } catch (err) { console.error(err); }
  };
  /* -------------------------------------------------------------------------- */

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("joinRoom", currentUserId);
    socketRef.current.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUserId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, imagePreview]); // Added imagePreview dependency

  /* --- NEW HANDLERS --- */

  // 1. Handle Emoji Click
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
    // Optional: setShowEmojiPicker(false); // Uncomment if you want it to close after selection
  };

  // 2. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create local preview URL
    }
  };

  // 3. Clear Image Selection
  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Send Message (Updated)
  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser || !currentUserId) return;

    // TODO: In a real app, upload `selectedFile` to your backend/S3 first, 
    // get the URL, and then send it in the socket message.
    // For now, we will simulate it using the local preview URL or base64.
    
    let uploadedImageUrl = undefined;
    if (selectedFile) {
        // Mock upload: usually await api.upload(formData)
        uploadedImageUrl = imagePreview || ""; 
    }

    const msg: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      text: input,
      image: uploadedImageUrl,
      timestamp: new Date().toISOString(),
    };

    socketRef.current?.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    
    // Reset states
    setInput("");
    setShowEmojiPicker(false);
    clearImage();
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      <Header handleLogout={() => {}} />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 min-h-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-1 min-h-0">
          
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="Search chats..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {filteredUsers.map((u) => (
                <div key={u.id} onClick={() => { setSelectedUser(u); loadMessages(u.id); }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedUser?.id === u.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"}`}
                >
                  <img src={u.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                  <div className="overflow-hidden flex-1">
                    <p className={`font-semibold text-sm ${selectedUser?.id === u.id ? "text-indigo-900" : "text-slate-700"}`}>{u.name}</p>
                    <p className={`text-xs truncate mt-0.5 ${selectedUser?.id === u.id ? "text-indigo-500 font-medium" : "text-slate-400"}`}>{u.lastMessage || "Start a conversation"}</p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <div className="text-center text-slate-400 text-sm py-8">No chats found</div>}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50/30 min-w-0 relative">
            {selectedUser ? (
              <>
                <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <img src={selectedUser.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                    <h3 className="font-bold text-slate-800">{selectedUser.name}</h3>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-full hover:text-indigo-600 transition-colors">
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" onClick={() => setShowEmojiPicker(false)}>
                  {messages.map((m, index) => {
                    const isSender = m.senderId === currentUserId;
                    const date = new Date(m.timestamp);
                    const time = !isNaN(date.getTime()) ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                    
                    return (
                      <div key={m.id || index} className={`flex ${isSender ? "justify-end" : "justify-start"} group`}>
                        <div className={`max-w-[70%] px-5 py-3 shadow-sm relative ${isSender ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none" : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none"}`}>
                          
                          {/* Render Image if exists */}
                          {m.image && (
                            <img src={m.image} alt="Sent" className="w-full max-w-sm rounded-lg mb-2 border border-black/10" />
                          )}
                          
                          {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                          <p className={`text-[10px] mt-1 text-right opacity-70 ${isSender ? "text-indigo-100" : "text-slate-400"}`}>{time}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 relative">
                  
                  {/* Image Preview Banner */}
                  {imagePreview && (
                    <div className="absolute bottom-full left-0 w-full bg-slate-100 p-3 flex items-center gap-3 border-t border-slate-200 shadow-sm z-20">
                        <div className="relative">
                             <img src={imagePreview} className="h-16 w-16 object-cover rounded-lg border border-slate-300" />
                             <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                                <X size={14} />
                             </button>
                        </div>
                        <span className="text-xs text-slate-500">Image selected</span>
                    </div>
                  )}

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 right-4 z-30 shadow-xl rounded-2xl border border-slate-100">
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        height={350}
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                    
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    {/* Media Button */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-200/50"
                        title="Upload Image"
                    >
                      <ImageIcon size={20} />
                    </button>
                    
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="Type your message..."
                      autoComplete="off"
                    />
                    
                    {/* Emoji Button */}
                    <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 transition-colors rounded-full hover:bg-slate-200/50 ${showEmojiPicker ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                    >
                      <Smile size={20} />
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && !selectedFile}
                      className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <MessageCircle size={48} className="text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-500">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}