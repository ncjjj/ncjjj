'use client';

import React, { useState, useRef, useEffect } from "react";

const initialMessages = [
  {
    id: 1,
    sender: "Consultant",
    text: "Hello! How can I assist you today?",
    timestamp: "10:00 AM",
  },
  {
    id: 2,
    sender: "You",
    text: "I have a question about my tax filing.",
    timestamp: "10:05 AM",
  },
];

export default function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "You",
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex justify-center mt-10">

      {/* MAIN CARD */}
      <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">

        {/* GOLD HEADER */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="flex flex-col h-[650px]">

          {/* CHAT HEADER */}
          <div className="px-6 py-4 border-b border-[#e8dcc0] flex items-center gap-4 bg-[#faf6ed]">
            
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] flex items-center justify-center text-white font-bold text-lg shadow">
              C
            </div>

            <div>
              <p className="font-semibold text-[#3b2f1c]">
                Consultant
              </p>
              <p className="text-xs text-green-600">● Online</p>
            </div>

          </div>

          {/* MESSAGES */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#fffaf0]"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "You"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-sm px-5 py-3 rounded-2xl shadow-md text-sm transition ${
                    message.sender === "You"
                      ? "bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white rounded-br-sm"
                      : "bg-[#f5e6c8] text-[#3b2f1c] rounded-bl-sm"
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="block text-[10px] mt-1 opacity-70 text-right">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-[#e8dcc0] flex gap-3 bg-white"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] focus:ring-2 focus:ring-[#d6b86a] outline-none"
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-medium shadow hover:scale-[1.05] transition"
            >
              Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}