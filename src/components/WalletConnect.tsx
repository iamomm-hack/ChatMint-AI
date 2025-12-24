"use client";

import { useWallet } from "@/contexts/WalletContext";
import type { Address } from "viem";

export default function WalletConnect() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  const formatAddress = (addr: Address | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm">
          <span className="text-slate-300">{formatAddress(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:border-slate-600 active:scale-95 transition-all cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="relative disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
    >
      {isConnecting ? (
        <div className="px-6 py-3 rounded-full bg-slate-800/90 border border-lime-400/50 text-lime-300 text-base font-semibold flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-lime-300 border-t-transparent rounded-full animate-spin" />
          Connecting...
        </div>
      ) : (
        <div className="relative flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800/90 border border-lime-400/50 text-[#9EFF00] text-base font-semibold hover:border-lime-400 hover:bg-slate-800 transition-all">
          <span>Connect Wallet</span>
          <span>→</span>
        </div>
      )}
    </button>
  );
}
