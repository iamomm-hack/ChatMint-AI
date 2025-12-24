"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Address } from "viem";

type WalletContextType = {
  address: Address | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  // check if MetaMask is installed
  const isMetaMaskInstalled = (): boolean => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  };

  // Get current account on mount and when accounts change
  useEffect(() => {
    if (!isMetaMaskInstalled() || !window.ethereum) return;

    const ethereum = window.ethereum;

    const checkConnection = async () => {
      try {
        const accounts = await ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0] as Address);
        }

        const chainId = await ethereum.request({
          method: "eth_chainId",
        });
        setChainId(Number(chainId));
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0] as Address);
      } else {
        setAddress(null);
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      setChainId(Number(chainId));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (ethereum) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connect = async () => {
    if (!isMetaMaskInstalled() || !window.ethereum) {
      alert("Please install MetaMask to connect your wallet!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    const ethereum = window.ethereum;
    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0] as Address);
      }

      const chainId = await ethereum.request({
        method: "eth_chainId",
      });
      setChainId(Number(chainId));

      // Check if on correct network (Aeneid testnet)
      // Note: Aeneid might not be in MetaMask's default list, so we'll just warn
      const aeneidChainId = 0x1a1; // 417 in decimal - Aeneid testnet
      if (Number(chainId) !== aeneidChainId) {
        console.warn("Please switch to Aeneid testnet for Story Protocol");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        alert("Please connect your MetaMask wallet to continue.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: address !== null,
        isConnecting,
        connect,
        disconnect,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

