import React, { useEffect } from 'react';
import FilterControls from './FilterControls';
import Summary from './Summary';
import Legend from './Legend';

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Filters and legend">
      <div className="fixed inset-0 z-[999] backdrop" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-top shadow-lg p-4 pt-2 h-[60svh] max-h-[60svh] overflow-y-auto pb-[env(safe-area-inset-bottom)] rounded-t-2xl">
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="px-2 py-1 text-sm border rounded" aria-label="Close drawer">Close</button>
        </div>
        <FilterControls />
        <div className="mt-4"><Summary /></div>
        <div className="mt-4"><Legend /></div>
      </div>
    </div>
  );
}
