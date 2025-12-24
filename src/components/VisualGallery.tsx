"use client";

import type { VisualAsset } from "@/types/visualAsset";

type VisualGalleryProps = {
  assets: VisualAsset[];
  onSelect: (asset: VisualAsset) => void;
  onDelete: (id: number) => void;
};

export default function VisualGallery({ assets, onSelect, onDelete }: VisualGalleryProps) {
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (confirm("Are you sure you want to delete this IP asset?")) {
      onDelete(id);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Your Visual IP Gallery</h2>

      {assets.length === 0 ? (
        <p className="text-slate-500">No visual IP minted yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((a) => (
            <div
              key={a.id}
              className="relative group cursor-pointer bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-[#9EFF00] transition-all"
            >
              <div onClick={() => onSelect(a)}>
                <img src={a.image} className="w-full h-60 object-cover" alt={a.name} />

                <div className="p-4">
                  <p className="text-lg font-semibold">{a.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {a.description}
                  </p>
                  <p className="text-xs text-[#9EFF00] mt-2">
                    IP ID: {a.ipId.slice(0, 12)}...
                  </p>
                </div>
              </div>

              {/* Delete button - appears on hover */}
              <button
                onClick={(e) => handleDelete(e, a.id)}
                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 active:scale-90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                title="Delete IP asset"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
