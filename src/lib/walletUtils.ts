import { getAddress, isAddress } from "viem";

/**
 * Validates and normalizes an Ethereum wallet address
 * @param address - The wallet address to validate
 * @returns Normalized checksum address or null if invalid
 */
export function validateWalletAddress(address: string): string | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  const trimmed = address.trim();

  // Check if it's a valid address format
  if (!isAddress(trimmed)) {
    return null;
  }

  // Reject zero address
  if (trimmed === "0x0000000000000000000000000000000000000000") {
    return null;
  }

  // Return checksummed address
  try {
    return getAddress(trimmed);
  } catch {
    return null;
  }
}

/**
 * Converts percentage to basis points (10000 = 100%)
 * @param percentage - Percentage value (e.g., 25.5 for 25.5%)
 * @returns Basis points (e.g., 2550 for 25.5%)
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Converts basis points to percentage
 * @param basisPoints - Basis points (e.g., 2550 for 25.5%)
 * @returns Percentage value (e.g., 25.5)
 */
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}

