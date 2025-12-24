"use client";

import { useState, useRef } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { validateWalletAddress, percentageToBasisPoints } from "@/lib/walletUtils";
import type { VisualAsset, OwnershipData } from "@/types/visualAsset";

type CoOwner = {
  id: string;
  percentage: string;
  walletAddress: string;
  validatedAddress: string | null;
};

type VisualFormProps = {
  visualAssets: VisualAsset[];
  setVisualAssets: (assets: VisualAsset[]) => void;
};

export default function VisualForm({ visualAssets, setVisualAssets }: VisualFormProps) {
  const { address, isConnected } = useWallet();
  
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [creator, setCreator] = useState("Om Kumar");
  const [description, setDescription] = useState("");
  const [traits, setTraits] = useState("");

  // Shared Ownership Declaration state
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [ownershipAcknowledged, setOwnershipAcknowledged] = useState(false);
  const [showOwnershipSection, setShowOwnershipSection] = useState(false);
  
  // Temporary co-owner being entered (before saving)
  const [tempCoOwner, setTempCoOwner] = useState<{
    percentage: string;
    walletAddress: string;
    validatedAddress: string | null;
  }>({
    percentage: "",
    walletAddress: "",
    validatedAddress: null,
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file type
    if (!f.type.startsWith("image/")) {
      setMsg("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (f.size > 10 * 1024 * 1024) {
      setMsg("Image size must be less than 10MB");
      return;
    }

    setImage(f);
    setPreview(URL.createObjectURL(f));
    setMsg("");
  }

  // Calculate total ownership percentage
  const totalOwnership = coOwners.reduce((sum, co) => {
    const pct = parseFloat(co.percentage) || 0;
    return sum + pct;
  }, 0);

  const remainingOwnership = 100 - totalOwnership;
  const canAddMore = remainingOwnership >= 0.01;

  // Add new co-owner
  function addCoOwner() {
    if (!canAddMore) return;
    setCoOwners([
      ...coOwners,
      {
        id: Date.now().toString(),
        percentage: "",
        walletAddress: "",
        validatedAddress: null,
      },
    ]);
  }

  // Remove co-owner
  function removeCoOwner(id: string) {
    setCoOwners(coOwners.filter((co) => co.id !== id));
  }

  // Update co-owner percentage
  function updateCoOwnerPercentage(id: string, value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== "") return;
    if (numValue < 0) return;
    if (numValue > remainingOwnership + (coOwners.find((co) => co.id === id)?.percentage ? parseFloat(coOwners.find((co) => co.id === id)!.percentage) : 0)) {
      return;
    }

    setCoOwners(
      coOwners.map((co) =>
        co.id === id
          ? { ...co, percentage: value }
          : co
      )
    );
  }

  // Update co-owner wallet address with validation
  function updateCoOwnerWallet(id: string, value: string) {
    const validated = validateWalletAddress(value);
    setCoOwners(
      coOwners.map((co) =>
        co.id === id
          ? { ...co, walletAddress: value, validatedAddress: validated }
          : co
      )
    );
  }

  // Update temporary co-owner percentage
  function updateTempCoOwnerPercentage(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== "") return;
    if (numValue < 0) return;
    const currentTotal = coOwners.reduce((sum, co) => sum + parseFloat(co.percentage || "0"), 0);
    const maxAllowed = 100 - currentTotal;
    if (numValue > maxAllowed) return;
    
    setTempCoOwner({ ...tempCoOwner, percentage: value });
  }

  // Update temporary co-owner wallet address
  function updateTempCoOwnerWallet(value: string) {
    const validated = validateWalletAddress(value);
    setTempCoOwner({ ...tempCoOwner, walletAddress: value, validatedAddress: validated });
  }

  // Save temporary co-owner
  function saveTempCoOwner() {
    const pct = parseFloat(tempCoOwner.percentage);
    if (isNaN(pct) || pct < 0.01) {
      setMsg("Ownership percentage must be at least 0.01%");
      return;
    }
    if (!tempCoOwner.validatedAddress) {
      setMsg("Please enter a valid wallet address");
      return;
    }
    
    // Check for duplicate wallets
    const duplicates = coOwners.filter(
      (co) => co.validatedAddress?.toLowerCase() === tempCoOwner.validatedAddress?.toLowerCase()
    );
    if (duplicates.length > 0) {
      setMsg("This wallet address is already added as a co-owner");
      return;
    }

    // Check if it's the same as primary owner
    if (address && tempCoOwner.validatedAddress.toLowerCase() === address.toLowerCase()) {
      setMsg("Co-owner wallet cannot be the same as primary owner wallet");
      return;
    }

    // Add to co-owners list
    const newCoOwner: CoOwner = {
      id: Date.now().toString(),
      percentage: tempCoOwner.percentage,
      walletAddress: tempCoOwner.walletAddress,
      validatedAddress: tempCoOwner.validatedAddress,
    };

    setCoOwners([...coOwners, newCoOwner]);
    
    // Clear temp fields
    setTempCoOwner({
      percentage: "",
      walletAddress: "",
      validatedAddress: null,
    });
    setMsg("");
  }

  // Check if temp co-owner can be saved
  const canSaveTempCoOwner = 
    parseFloat(tempCoOwner.percentage) >= 0.01 && 
    tempCoOwner.validatedAddress !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!image) {
      setMsg("Please upload an image");
      return;
    }

    if (!name.trim()) {
      setMsg("Please enter an image name");
      return;
    }

    if (!creator.trim()) {
      setMsg("Please enter a creator name");
      return;
    }

    if (!description.trim()) {
      setMsg("Please enter a description");
      return;
    }

    if (!address) {
      setMsg("Please connect your wallet");
      return;
    }

    // Ownership validation
    if (coOwners.length > 0) {
      // Validate all co-owners have valid data
      for (const co of coOwners) {
        const pct = parseFloat(co.percentage);
        if (isNaN(pct) || pct < 0.01) {
          setMsg(`Co-owner percentage must be at least 0.01%`);
          return;
        }
        if (!co.validatedAddress) {
          setMsg(`Invalid wallet address for co-owner: ${co.walletAddress}`);
          return;
        }
        // Check for duplicate wallets
        const duplicates = coOwners.filter(
          (c) => c.validatedAddress === co.validatedAddress && c.id !== co.id
        );
        if (duplicates.length > 0) {
          setMsg("Duplicate wallet addresses are not allowed");
          return;
        }
        // Check if co-owner wallet is the same as primary owner
        if (co.validatedAddress.toLowerCase() === address.toLowerCase()) {
          setMsg("Co-owner wallet cannot be the same as primary owner wallet");
          return;
        }
      }

      // Validate total ownership
      if (totalOwnership > 100) {
        setMsg("Total ownership cannot exceed 100%");
        return;
      }

      // Require acknowledgment
      if (!ownershipAcknowledged) {
        setMsg("You must acknowledge the Shared Ownership Declaration");
        return;
      }
    }

    // Calculate remaining share for primary owner (100% - total co-owner ownership)
    const primaryOwnerShare = Math.max(0, 100 - totalOwnership).toFixed(2);

    const fd = new FormData();
    fd.append("file", image);
    fd.append("name", name);
    fd.append("creator", creator);
    fd.append("share", primaryOwnerShare); // Primary owner's share (remaining after co-owners)
    fd.append("description", description);
    fd.append("traits", traits);
    fd.append("mintTokens", "true");
    fd.append("primaryOwnerWallet", address);

    // Add ownership data
    if (coOwners.length > 0) {
      const ownerships = coOwners.map((co) => ({
        walletAddress: co.validatedAddress!,
        ownershipPercentage: percentageToBasisPoints(parseFloat(co.percentage)),
      }));
      fd.append("ownerships", JSON.stringify(ownerships));
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/visual-register", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setMsg(data.error || "Failed to register IP. Please try again.");
        return;
      }

      // Success - create asset and update state
      const ownershipData: OwnershipData | undefined = coOwners.length > 0 ? {
        primaryOwnerWallet: address,
        isFrozen: true,
        ownerships: coOwners.map((co) => ({
          walletAddress: co.validatedAddress!,
          ownershipPercentage: percentageToBasisPoints(parseFloat(co.percentage)),
        })),
      } : undefined;

      const asset: VisualAsset = {
        id: Date.now(),
        image: data.imageUrl,
        name,
        description,
        traits: traits.split(",").map(t => t.trim()),
        creator,
        share: primaryOwnerShare, // Primary owner's remaining share
        metadataUrl: data.metadataUrl,
        ipId: data.ipId,
        txHash: data.txHash,
        ownership: ownershipData,
      };

      const updated = [...visualAssets, asset];
      setVisualAssets(updated);
      localStorage.setItem("visualGallery", JSON.stringify(updated));

      // Reset form
      setImage(null);
      setPreview(null);
      setName("");
      setCreator("Om Kumar");
      setDescription("");
      setTraits("");
      setCoOwners([]);
      setOwnershipAcknowledged(false);
      setShowOwnershipSection(false);
      setTempCoOwner({
        percentage: "",
        walletAddress: "",
        validatedAddress: null,
      });

      setMsg("Minted Successfully!");
    } catch (networkError) {
      setLoading(false);
      setMsg("Network error. Please check your internet connection and try again.");
    }
  }

  return (
    <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Register Visual IP</h2>
        {isConnected && address && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500">Wallet: </span>
            <span className="text-lime-400 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {/* IMAGE UPLOAD */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-600 p-6 rounded-xl cursor-pointer text-center"
      >
        {preview ? (
          <img src={preview} className="w-full rounded-lg" />
        ) : (
          <p className="text-slate-400">Click to Upload Image</p>
        )}
      </div>

      <input
        type="file"
        ref={fileRef}
        onChange={handleSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Metadata fields */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">

        <input
          className="w-full bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg"
          placeholder="Image Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg"
          placeholder="Creator Name"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        />

        {/* Co-Owner Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowOwnershipSection(!showOwnershipSection)}
            className="w-full bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-left hover:bg-slate-700 hover:border-slate-500 active:scale-95 transition-all cursor-pointer flex items-center justify-between"
          >
            <span className="text-slate-300 font-semibold">Co-Owner</span>
            <span className="text-lime-400 text-sm">
              {showOwnershipSection ? "▼" : "▶"}
            </span>
          </button>

          {/* Shared Ownership Declaration Section */}
          {showOwnershipSection && (
            <div className="mt-4 space-y-4 border border-slate-700 rounded-lg p-4 bg-slate-800/50">
              {/* Legal Text */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                <p className="mb-2">
                  During the registration of a Visual IP, the registrant may allocate a defined percentage of ownership to one or more third parties.
                </p>
                <p className="mb-2">
                  For each shared allocation, the registrant must provide:
                </p>
                <ul className="list-disc list-inside mb-2 space-y-1 ml-2">
                  <li>Ownership Share Percentage (expressed as a fixed percentage of the total ownership, not exceeding 100% in aggregate), and</li>
                  <li>Recipient Wallet Address, which uniquely identifies the beneficiary of the shared ownership.</li>
                </ul>
                <p className="mb-2">
                  Upon successful registration, the specified ownership percentage shall be irrevocably assigned to the provided wallet address unless otherwise stated.
                </p>
                <p className="mb-2">
                  The wallet address holder shall be recognized as a co-owner of the Visual IP with rights proportional to the allocated percentage.
                </p>
                <p className="mb-2">
                  Ownership share applies to all applicable benefits derived from the Visual IP, including but not limited to royalties, licensing revenue, resale proceeds, or other monetization mechanisms supported by the platform.
                </p>
                <p>
                  The registrant acknowledges that ownership allocation is final and binding once the Visual IP is registered, that the platform is not responsible for incorrect or inaccessible wallet addresses, and that any future modification or transfer of ownership is subject to platform rules and smart-contract constraints.
                </p>
              </div>

              {/* Warning Text */}
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <p className="text-red-400 text-sm font-semibold">
                  ⚠️ Ownership percentages and wallet addresses are final and cannot be changed after registration.
                </p>
              </div>

              {/* Ownership Counter */}
              <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <span className="text-sm text-slate-300">Total Ownership Allocated:</span>
                <span className={`text-lg font-bold ${totalOwnership > 100 ? "text-red-400" : totalOwnership === 100 ? "text-lime-400" : "text-slate-300"}`}>
                  {totalOwnership.toFixed(2)}% / 100%
                </span>
              </div>

              {/* Saved Co-Owners List */}
              {coOwners.map((coOwner) => (
                <div
                  key={coOwner.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">Co-Owner</span>
                    <button
                      type="button"
                      onClick={() => removeCoOwner(coOwner.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Percentage: </span>
                      <span className="text-lime-400 font-semibold">{coOwner.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Wallet: </span>
                      <span className="text-slate-300 font-mono">
                        {coOwner.validatedAddress?.slice(0, 6)}...{coOwner.validatedAddress?.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Temporary Co-Owner Input Form */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Add New Co-Owner</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Ownership Share Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remainingOwnership}
                        value={tempCoOwner.percentage}
                        onChange={(e) => updateTempCoOwnerPercentage(e.target.value)}
                        placeholder="0.01 - 100"
                        className="w-full bg-slate-900 border border-slate-600 px-4 py-2 rounded-lg text-sm"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Max: {remainingOwnership.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Recipient Wallet Address
                    </label>
                    <input
                      type="text"
                      value={tempCoOwner.walletAddress}
                      onChange={(e) => updateTempCoOwnerWallet(e.target.value)}
                      placeholder="0x..."
                      className={`w-full bg-slate-900 border px-4 py-2 rounded-lg text-sm font-mono ${
                        tempCoOwner.walletAddress && !tempCoOwner.validatedAddress
                          ? "border-red-500"
                          : tempCoOwner.validatedAddress
                          ? "border-lime-500"
                          : "border-slate-600"
                      }`}
                    />
                    {tempCoOwner.walletAddress && !tempCoOwner.validatedAddress && (
                      <p className="text-xs text-red-400 mt-1">Invalid wallet address</p>
                    )}
                    {tempCoOwner.validatedAddress && (
                      <p className="text-xs text-lime-400 mt-1">
                        ✓ Valid: {tempCoOwner.validatedAddress.slice(0, 6)}...{tempCoOwner.validatedAddress.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Button - Only shows when both fields are filled */}
                {canSaveTempCoOwner && (
                  <button
                    type="button"
                    onClick={saveTempCoOwner}
                    className="w-full bg-lime-400 text-black font-semibold py-2 rounded-lg hover:bg-lime-300 active:scale-95 transition-all cursor-pointer text-sm"
                  >
                    Save Co-Owner
                  </button>
                )}
              </div>

              {/* Add Co-Owner Button - Shows after section is opened */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => {
                    setTempCoOwner({
                      percentage: "",
                      walletAddress: "",
                      validatedAddress: null,
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700 hover:border-slate-500 active:scale-95 transition-all cursor-pointer text-sm font-semibold"
                >
                  + Add Co-Owner
                </button>
              )}

              {/* Acknowledgment Checkbox */}
              {coOwners.length > 0 && (
                <div className="flex items-start gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <input
                    type="checkbox"
                    id="ownership-ack"
                    checked={ownershipAcknowledged}
                    onChange={(e) => setOwnershipAcknowledged(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-lime-400 focus:ring-lime-400 focus:ring-2"
                  />
                  <label htmlFor="ownership-ack" className="text-sm text-slate-300 cursor-pointer">
                    I acknowledge that I have read and understood the Shared Ownership Declaration. I understand that ownership allocation is final and binding, and that incorrect wallet addresses will result in permanent allocation loss.
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <textarea
          className="w-full bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg"
          placeholder="Traits (comma separated)"
          value={traits}
          onChange={(e) => setTraits(e.target.value)}
        />

        {msg && (
          <p className={`text-sm ${msg.includes("Successfully") ? "text-lime-400" : "text-red-400"}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (coOwners.length > 0 && totalOwnership > 100)}
          className="w-full bg-[#9EFF00] text-black font-bold py-3 rounded-lg hover:bg-lime-400 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register on MintChat"}
        </button>
      </form>
    </div>
  );
}
