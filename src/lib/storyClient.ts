// src/lib/storyClient.ts
import { http } from "viem";
import { privateKeyToAccount, type Account, type Address } from "viem/accounts";
import { StoryClient, type StoryConfig } from "@story-protocol/core-sdk";

// Validate and normalize private key
function normalizePrivateKey(key: string | undefined): Address {
  if (!key || key.trim() === "") {
    throw new Error("STORY_PRIVATE_KEY is not set in .env.local");
  }

  let privateKeyStr = key.trim();
  
  // Remove 0x prefix if present
  if (privateKeyStr.startsWith("0x") || privateKeyStr.startsWith("0X")) {
    privateKeyStr = privateKeyStr.slice(2);
  }

  // Validate hex format (should be 64 hex characters = 32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(privateKeyStr)) {
    throw new Error(
      "STORY_PRIVATE_KEY must be a valid 64-character hex string (32 bytes). " +
      "It can include or exclude the 0x prefix."
    );
  }

  return `0x${privateKeyStr}` as Address;
}

// Validate environment variables
if (!process.env.STORY_RPC_URL || process.env.STORY_RPC_URL.trim() === "") {
  throw new Error("STORY_RPC_URL is not set in .env.local");
}

// Normalize and create account
const privateKey = normalizePrivateKey(process.env.STORY_PRIVATE_KEY);
export const account: Account = privateKeyToAccount(privateKey);

const config: StoryConfig = {
  account,
  transport: http(process.env.STORY_RPC_URL),
  chainId: "aeneid", // Story Network testnet
};

export const storyClient = StoryClient.newClient(config);
