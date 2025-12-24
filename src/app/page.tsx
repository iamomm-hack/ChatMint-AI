"use client";

import WalletConnect from "../components/WalletConnect";
import { useWallet } from "@/contexts/WalletContext";
import Link from "next/link";
import type { Address } from "viem";

export default function HomePage() {
  const { isConnected, address, chainId } = useWallet();

  const formatAddress = (addr: Address | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show login screen if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">
        {/* Minimal 3D Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="login-3d-container">
            <div className="login-3d-cube">
              <div className="login-3d-face login-3d-front"></div>
              <div className="login-3d-face login-3d-back"></div>
              <div className="login-3d-face login-3d-right"></div>
              <div className="login-3d-face login-3d-left"></div>
              <div className="login-3d-face login-3d-top"></div>
              <div className="login-3d-face login-3d-bottom"></div>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto px-4 relative z-10">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 text-white">
            ChatMint
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-12">
            Decentralized IP & AI protocol for the next web.
          </p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Starry Background Pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 starry-bg" />
      </div>

      {/* Subtle gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(190,242,100,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(56,189,248,0.06),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-300 flex items-center justify-center shadow-lg shadow-lime-400/20">
              <div className="w-5 h-5 rounded-full bg-slate-950" />
            </div>
            <span className="font-bold text-xl tracking-tight">ChatMint AI</span>
          </div>

          {/* Protocol State Badge */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block">
            <div className="px-4 py-1.5 rounded-full bg-red-600/90 border border-red-500/50 backdrop-blur-sm">
              <span className="text-white text-xs font-semibold tracking-wide">
                PROTOCOL STATE: ACTIVE
              </span>
            </div>
          </div>

          {/* Network & Wallet Info */}
          <div className="flex items-center gap-4">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">
                {chainId === 417 ? "Aeneid" : chainId ? `Chain ${chainId}` : "Unknown"}
              </span>
            </div>

            {/* Wallet Address */}
            {address && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <span className="text-xs text-slate-300 font-mono">
                  {formatAddress(address)}
                </span>
              </div>
            )}

            {/* Disconnect Button */}
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Central Geometric Shape & Title */}
        <div className="relative mb-16 flex flex-col items-center">
          {/* 3D Wireframe Geometric Shape */}
          <div className="nexus-animation">
  <div className="nexus-sphere">
    <div className="nexus-core"></div>

    <div className="nexus-ring ring-1"></div>
    <div className="nexus-ring ring-2"></div>
    <div className="nexus-ring ring-3"></div>
    <div className="nexus-ring ring-4"></div>
  </div>
</div>



          {/* Title Overlay */}
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 text-white">
              Select Dashboard
            </h1>
            <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
              Choose a feature to access with your connected wallet
            </p>
          </div>
        </div>

        {/* Identity Selection Cards */}
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4">
          {/* Card 1: Idea Chat Studio */}
          <Link
            href="/studio"
            className="group relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 hover:border-lime-400/50 hover:bg-slate-900/90 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-lime-400/10 border border-lime-400/30 mb-6 flex items-center justify-center group-hover:bg-lime-400/20 group-hover:border-lime-400/50 transition-all">
                <svg
                  className="w-8 h-8 text-lime-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-lime-300 transition-colors">
                Idea Chat Studio
              </h2>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Generate creative ideas using AI-powered chat with Gemini
              </p>

              {/* Button */}
              <div className="mt-auto w-full">
                <div className="px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-lime-400 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-lime-400/10 group-hover:border-lime-400/50 transition-all">
                  Enter Studio
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Register Visual IP */}
          <Link
            href="/register"
            className="group relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 hover:border-lime-400/50 hover:bg-slate-900/90 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-lime-400/10 border border-lime-400/30 mb-6 flex items-center justify-center group-hover:bg-lime-400/20 group-hover:border-lime-400/50 transition-all">
                <svg
                  className="w-8 h-8 text-lime-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-lime-300 transition-colors">
                Register Visual IP
              </h2>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Upload and register your visual creations as IP on Story Protocol
              </p>

              {/* Button */}
              <div className="mt-auto w-full">
                <div className="px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-lime-400 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-lime-400/10 group-hover:border-lime-400/50 transition-all">
                  Enter Dashboard
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Visual IP Gallery */}
          <Link
            href="/gallery"
            className="group relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 hover:border-lime-400/50 hover:bg-slate-900/90 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-lime-400/10 border border-lime-400/30 mb-6 flex items-center justify-center group-hover:bg-lime-400/20 group-hover:border-lime-400/50 transition-all">
                <svg
                  className="w-8 h-8 text-lime-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-lime-300 transition-colors">
                Visual IP Gallery
              </h2>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                View and manage all your registered intellectual property assets
              </p>

              {/* Button */}
              <div className="mt-auto w-full">
                <div className="px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-lime-400 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-lime-400/10 group-hover:border-lime-400/50 transition-all">
                  Enter Dashboard
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
