"use client";

import { useState } from "react";

export default function ChatBox() {

  function cleanText(t: string) {
    return t
      .replace(/[*#>_-]+/g, " ")
      .replace(/[""]/g, "")
      .replace(/[ ]{2,}/g, " ")
      .trim();
  }

  type Message = {
    id: number;
    role: "user" | "assistant";
    content: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: cleanText(input)
    };

    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg.content })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: cleanText(data.reply)
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(data.error || "Failed to get response from AI");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
      console.error("Chat error:", err);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-xl font-semibold mb-4">AI Text Chat</h2>

      <div className="h-64 overflow-y-auto bg-slate-900 p-4 rounded-lg space-y-3 text-sm">
        {messages.length === 0 && !loading && (
          <p className="text-slate-400 text-center py-8">
            Start a conversation with AI to generate creative ideas...
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              m.role === "user"
                ? "ml-auto bg-[#9EFF00] text-black"
                : "bg-slate-700"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-slate-700 max-w-[80%]">
            <span className="text-slate-400">Thinking...</span>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-xs">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-800 px-4 py-2 rounded-lg border border-slate-600"
          placeholder="Type something..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-6 py-2 bg-[#9EFF00] hover:bg-lime-400 active:scale-95 text-black font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
