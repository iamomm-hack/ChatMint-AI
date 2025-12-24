"use client";

import ChatBox from "@/components/ChatBox";
import { useWallet } from "@/contexts/WalletContext";
import Link from "next/link";

export default function StudioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-slate-400 mb-8">
            You need to connect your MetaMask wallet to access the Chat Studio.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-lime-400 text-slate-950 font-semibold hover:bg-lime-300 active:scale-95 transition-all cursor-pointer inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-lime-400 hover:text-lime-300 inline-flex items-center gap-2 mb-6 active:scale-95 transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Idea Chat Studio</h1>
          <p className="text-slate-400">
            Generate clean, structured ideas using the chat studio powered by Gemini AI.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI Text Chat</h2>
            <span className="text-xs text-slate-500">
              Gemini powered, cleaned output
            </span>
          </div>
          <ChatBox />
        </div>
      </div>
    </div>
  );
}

