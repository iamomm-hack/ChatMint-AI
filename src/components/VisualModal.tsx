import type { VisualAsset } from "@/types/visualAsset";

type VisualModalProps = {
  asset: VisualAsset;
  onClose: () => void;
};

export default function VisualModal({ asset, onClose }: VisualModalProps) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-6 z-50">
  
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 relative">
  
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white active:scale-90 text-xl transition-all cursor-pointer"
          >
            ✕
          </button>
  
          <img
            src={asset.image}
            className="w-full h-80 object-cover rounded-xl mb-6"
          />
  
          <h2 className="text-3xl font-bold mb-3">{asset.name}</h2>
  
          <p className="text-slate-300 mb-4">{asset.description}</p>
  
          <h3 className="font-semibold">Traits</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {asset.traits.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-slate-700 rounded-full text-xs">
                {t}
              </span>
            ))}
          </div>
  
          <div className="text-sm text-slate-400 space-y-1">
            <p><b className="text-slate-200">Creator:</b> {asset.creator}</p>
            <p><b className="text-slate-200">Share:</b> {asset.share}%</p>
            
            {/* Ownership Information */}
            {asset.ownership && asset.ownership.ownerships.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-200 font-semibold mb-2">Shared Ownership:</p>
                <p className="text-xs text-slate-400 mb-2">
                  Primary Owner: {asset.ownership.primaryOwnerWallet.slice(0, 6)}...{asset.ownership.primaryOwnerWallet.slice(-4)}
                </p>
                <p className="text-xs text-slate-400 mb-2">
                  Status: {asset.ownership.isFrozen ? "Frozen (Immutable)" : "Active"}
                </p>
                <div className="space-y-1">
                  {asset.ownership.ownerships.map((own, idx) => (
                    <p key={idx} className="text-xs">
                      <span className="text-lime-400">
                        {(own.ownershipPercentage / 100).toFixed(2)}%
                      </span>
                      {" → "}
                      <span className="font-mono">
                        {own.walletAddress.slice(0, 6)}...{own.walletAddress.slice(-4)}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p><b className="text-slate-200">Metadata:</b> {asset.metadataUrl}</p>
            <p><b className="text-slate-200">IP ID:</b> {asset.ipId}</p>
            <p><b className="text-slate-200">Tx Hash:</b> {asset.txHash}</p>

            <a
              href={`https://aeneid.explorer.storyprotocol.xyz/tx/${asset.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9EFF00] hover:text-lime-300 underline mt-3 inline-block transition-colors cursor-pointer"
            >
              View on Story Explorer →
            </a>
          </div>
  
        </div>
      </div>
    );
  }
  