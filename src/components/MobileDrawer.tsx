/**
 * @fileoverview Mobile Drawer Component
 * Provides a bottom-sheet drawer for mobile and tablet devices.
 * Displays filters, summary, and legend in a responsive overlay.
 * @module components/MobileDrawer
 */

import React, { useEffect } from 'react';
import FilterControls from './FilterControls';
import Summary from './Summary';
import Legend from './Legend';
import ErrorBanner from './ErrorBanner';
import { useEarthquakes } from '../context/EarthquakeContext';

/**
 * Mobile Drawer Props
 */
interface MobileDrawerProps {
  /** Whether the drawer is currently open */
  open: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
}

/**
 * Mobile Drawer Component
 * 
 * A bottom-sheet style drawer optimized for mobile and tablet devices.
 * Features:
 * - 60% screen height overlay
 * - Backdrop dismiss (click outside to close)
 * - Keyboard dismiss (Escape key)
 * - Safe area support for notched devices
 * - Visual handle bar for affordance
 * - Scrollable content area
 * - Error handling with retry capability
 * 
 * Contains:
 * - ErrorBanner: API error display with retry
 * - FilterControls: Interactive filters
 * - Summary: Earthquake statistics
 * - Legend: Color scale explanation
 * 
 * @param props - Component props
 * @returns Bottom sheet drawer when open, null when closed
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <MobileDrawer open={open} onClose={() => setOpen(false)} />
 * ```
 */
export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { error, refresh, clearError, loading } = useEarthquakes();
  
  /**
   * Keyboard event handler for Escape key dismiss.
   * Cleans up event listener when drawer closes or unmounts.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose(); 
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Filters and legend">
      {/* Backdrop - click to dismiss */}
      <div className="fixed inset-0 z-[999] backdrop" onClick={onClose} />
      
      {/* Drawer content */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-top shadow-lg p-4 pt-2 h-[60svh] max-h-[60svh] overflow-y-auto pb-[env(safe-area-inset-bottom)] rounded-t-2xl">
        {/* Handle bar for visual affordance */}
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
        
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button 
            onClick={onClose} 
            className="px-2 py-1 text-sm border rounded" 
            aria-label="Close drawer"
          >
            Close
          </button>
        </div>
        
        {/* Error banner for mobile users */}
        {error && (
          <div className="mb-3">
            <ErrorBanner 
              error={error} 
              onRetry={refresh}
              onDismiss={clearError}
              isRetrying={loading}
            />
          </div>
        )}
        
        {/* Drawer content sections */}
        <FilterControls />
        <div className="mt-4"><Summary /></div>
        <div className="mt-4"><Legend /></div>
      </div>
    </div>
  );
}
