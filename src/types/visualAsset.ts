export type OwnershipData = {
  primaryOwnerWallet: string;
  isFrozen: boolean;
  ownerships: Array<{
    walletAddress: string;
    ownershipPercentage: number; // in basis points
  }>;
};

export type VisualAsset = {
  id: number;
  image: string;
  name: string;
  description: string;
  traits: string[];
  creator: string;
  share: string;
  metadataUrl: string;
  ipId: string;
  txHash: string;
  ownership?: OwnershipData;
};

