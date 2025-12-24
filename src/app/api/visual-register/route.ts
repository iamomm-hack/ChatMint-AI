import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { storyClient, account } from "@/lib/storyClient";
import { keccak256, toBytes, formatEther } from "viem";

export const runtime = "nodejs";


async function uploadToPinata(file: File) {
  if (!process.env.PINATA_JWT || process.env.PINATA_JWT.trim() === "") {
    throw new Error("PINATA_JWT is not set in .env.local");
  }

  // ensure jwt has Bearer prefix if not already present
  let jwtToken = process.env.PINATA_JWT.trim();
  if (!jwtToken.startsWith("Bearer ")) {
    jwtToken = `Bearer ${jwtToken}`;
  }

  const form = new FormData();
  form.append("file", Buffer.from(await file.arrayBuffer()), file.name);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: jwtToken,
          ...form.getHeaders()
        }
      }
    );

    if (!res.data || !res.data.IpfsHash) {
      throw new Error("Invalid response from Pinata: missing IpfsHash");
    }

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Pinata authentication failed. Please check your PINATA_JWT token in .env.local");
    }
    if (error.response?.status === 403) {
      throw new Error("Pinata access forbidden. Please verify your API key permissions.");
    }
    throw new Error(`Pinata upload failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File;
    const name = form.get("name") as string;
    const creator = form.get("creator") as string;
    const share = form.get("share") as string;
    const description = form.get("description") as string;
    const traits = form.get("traits") as string;
    const mintTokens = form.get("mintTokens") === "true";
    const primaryOwnerWallet = form.get("primaryOwnerWallet") as string;
    const ownershipsJson = form.get("ownerships") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image uploaded" });
    }

    // Validate ownership data if provided
    let ownerships: Array<{ walletAddress: string; ownershipPercentage: number }> = [];
    let totalOwnershipBasisPoints = 0;

    if (ownershipsJson) {
      try {
        ownerships = JSON.parse(ownershipsJson);
        
        // Validate ownership structure
        if (!Array.isArray(ownerships)) {
          return NextResponse.json(
            { success: false, error: "Invalid ownership data format" },
            { status: 400 }
          );
        }

        // Validate each ownership entry
        const walletAddresses = new Set<string>();
        for (const ownership of ownerships) {
          // Validate structure
          if (!ownership.walletAddress || typeof ownership.ownershipPercentage !== "number") {
            return NextResponse.json(
              { success: false, error: "Invalid ownership entry: missing wallet address or percentage" },
              { status: 400 }
            );
          }

          // Validate wallet address (basic check)
          const addr = ownership.walletAddress.toLowerCase();
          if (!addr.startsWith("0x") || addr.length !== 42) {
            return NextResponse.json(
              { success: false, error: `Invalid wallet address: ${ownership.walletAddress}` },
              { status: 400 }
            );
          }

          // Reject zero address
          if (addr === "0x0000000000000000000000000000000000000000") {
            return NextResponse.json(
              { success: false, error: "Zero address (0x0000...) is not allowed" },
              { status: 400 }
            );
          }

          // Check for duplicate wallets
          if (walletAddresses.has(addr)) {
            return NextResponse.json(
              { success: false, error: "Duplicate wallet addresses are not allowed" },
              { status: 400 }
            );
          }
          walletAddresses.add(addr);

          // Validate percentage (in basis points: 0-10000)
          if (ownership.ownershipPercentage < 1 || ownership.ownershipPercentage > 10000) {
            return NextResponse.json(
              { success: false, error: "Ownership percentage must be between 0.01% and 100%" },
              { status: 400 }
            );
          }

          totalOwnershipBasisPoints += ownership.ownershipPercentage;
        }

        // Validate total ownership doesn't exceed 100%
        if (totalOwnershipBasisPoints > 10000) {
          return NextResponse.json(
            { success: false, error: "Total ownership cannot exceed 100%" },
            { status: 400 }
          );
        }

        // Check if primary owner wallet matches any co-owner
        if (primaryOwnerWallet) {
          const primaryAddr = primaryOwnerWallet.toLowerCase();
          if (walletAddresses.has(primaryAddr)) {
            return NextResponse.json(
              { success: false, error: "Primary owner wallet cannot be the same as a co-owner wallet" },
              { status: 400 }
            );
          }
        }
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: "Invalid ownership JSON format" },
          { status: 400 }
        );
      }
    }

    //upload image to Pinata
    const imageUrl = await uploadToPinata(file);

    //metadata json(pinata)
    const metadata: any = {
      name,
      description,
      image: imageUrl,
      creator,
      share_percent: share,
      traits: traits.split(",").map(t => t.trim()),
      mint_license_tokens: mintTokens,
      primary_owner_wallet: primaryOwnerWallet || null,
      ownership_data: ownerships.length > 0 ? {
        is_frozen: true,
        total_ownership_basis_points: totalOwnershipBasisPoints,
        ownerships: ownerships.map((o) => ({
          wallet_address: o.walletAddress,
          ownership_percentage_basis_points: o.ownershipPercentage,
        })),
      } : null,
    };

    //ensure JWT has Bearer prefix if not already present
    let jwtToken = process.env.PINATA_JWT?.trim() || "";
    if (!jwtToken.startsWith("Bearer ")) {
      jwtToken = `Bearer ${jwtToken}`;
    }

    let metadataRes;
    try {
      metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            Authorization: jwtToken,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { success: false, error: "Pinata authentication failed. Please check your PINATA_JWT token in .env.local" },
          { status: 401 }
        );
      }
      if (error.response?.status === 403) {
        return NextResponse.json(
          { success: false, error: "Pinata access forbidden. Please verify your API key permissions." },
          { status: 403 }
        );
      }
      throw error;
    }

    if (!metadataRes.data || !metadataRes.data.IpfsHash) {
      return NextResponse.json(
        { success: false, error: "Invalid response from Pinata: missing metadata hash" },
        { status: 500 }
      );
    }

    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`;

    //story protocol → Register IP
    if (!process.env.SPG_NFT_CONTRACT) {
      return NextResponse.json(
        { success: false, error: "SPG_NFT_CONTRACT is not set in .env.local" },
        { status: 500 }
      );
    }

    const ipMetadataHash = keccak256(toBytes(metadataUrl));
    const nftMetadataHash = keccak256(toBytes(metadataUrl));

    // recipient address for IP registration
    const recipientAddress = "0x230B0b3B70f499479106bcE0a57Ba8A0562354a2" as `0x${string}`;

    // Check wallet balance before attempting transaction
    try {
      const balanceResponse = await fetch(process.env.STORY_RPC_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [account.address, "latest"],
          id: 1,
        }),
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.result) {
          const balanceWei = BigInt(balanceData.result);
          const balanceEth = parseFloat(formatEther(balanceWei));
          const minBalance = 0.001; // Minimum balance needed (adjust as needed)

          if (balanceEth < minBalance) {
            return NextResponse.json({
              success: false,
              error: `Insufficient funds. Your wallet (${account.address.slice(0, 6)}...${account.address.slice(-4)}) has ${balanceEth.toFixed(6)} ETH. You need at least ${minBalance} ETH for gas fees. Please fund your wallet with testnet tokens.`,
            }, { status: 400 });
          }
        }
      }
    } catch (balanceError) {
      // if balance check fails, continue anyway-the transaction will fail with a clearer error
      console.warn("Could not check balance:", balanceError);
    }

    // attempt blockchain transaction
    try {
      const tx = await storyClient.ipAsset.mintAndRegisterIp({
        spgNftContract: process.env.SPG_NFT_CONTRACT as `0x${string}`,
        recipient: recipientAddress,
        ipMetadata: {
          ipMetadataURI: metadataUrl,
          ipMetadataHash,
          nftMetadataURI: metadataUrl,
          nftMetadataHash
        },
        allowDuplicates: true
      });

      return NextResponse.json({
        success: true,
        imageUrl,
        metadataUrl,
        ipId: tx.ipId,
        txHash: tx.txHash,
        ownership: ownerships.length > 0 ? {
          primaryOwnerWallet: primaryOwnerWallet || "",
          isFrozen: true,
          ownerships: ownerships,
        } : undefined,
      });
    } catch (txError: any) {
      // Handle specific blockchain errors
      const errorMessage = txError?.message || String(txError);
      
      if (errorMessage.includes("insufficient funds") || errorMessage.includes("exceeds the balance")) {
        return NextResponse.json({
          success: false,
          error: `Insufficient funds for transaction. Your wallet (${account.address.slice(0, 6)}...${account.address.slice(-4)}) needs more testnet tokens to pay for gas fees. Please fund your wallet and try again.`,
        }, { status: 400 });
      }

      if (errorMessage.includes("network") || errorMessage.includes("fetch failed")) {
        return NextResponse.json({
          success: false,
          error: "Network error. Please check your internet connection and try again.",
        }, { status: 503 });
      }

      throw txError;
    }
  } catch (err: any) {
    console.error("Visual IP mint error:", err);
    
    // Extract user-friendly error message
    let errorMessage = "An unexpected error occurred";
    
    if (err.message) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }

    // check for specific error patterns
    if (errorMessage.includes("insufficient funds") || errorMessage.includes("exceeds the balance")) {
      errorMessage = `Insufficient funds. Your wallet needs more testnet tokens to pay for gas fees. Please fund your wallet (${account.address.slice(0, 6)}...${account.address.slice(-4)}) and try again.`;
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch failed")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    } else if (errorMessage.includes("Pinata")) {

    } else if (errorMessage.includes("STORY") || errorMessage.includes("RPC")) {
      errorMessage = "Blockchain connection error. Please check your STORY_RPC_URL in .env.local";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
