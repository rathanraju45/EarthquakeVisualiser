/**
 * @fileoverview Error Banner Component
 * Displays user-friendly error messages with retry capabilities.
 * Shows different styles for retryable vs non-retryable errors.
 * @module components/ErrorBanner
 */

import React from 'react';
import type { ErrorInfo } from '../context/EarthquakeContext';

/**
 * Error Banner Props
 */
interface ErrorBannerProps {
  /** Error information to display */
  error: ErrorInfo;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Callback to dismiss the error */
  onDismiss?: () => void;
  /** Whether a retry operation is in progress */
  isRetrying?: boolean;
}

/**
 * Error Banner Component
 * 
 * Displays error messages in a prominent banner at the top of the interface.
 * Features:
 * - Color-coded based on error severity
 * - Retry button for recoverable errors
 * - Dismiss button to clear the error
 * - Icon indicators for different error types
 * - ARIA-live region for screen readers
 * 
 * @param props - Component props
 * @returns Error banner UI
 * 
 * @example
 * ```tsx
 * const { error, refresh, clearError, loading } = useEarthquakes();
 * 
 * {error && (
 *   <ErrorBanner 
 *     error={error} 
 *     onRetry={refresh}
 *     onDismiss={clearError}
 *     isRetrying={loading}
 *   />
 * )}
 * ```
 */
export default function ErrorBanner({ 
  error, 
  onRetry, 
  onDismiss, 
  isRetrying = false 
}: ErrorBannerProps) {
  const isRetryable = error.isRetryable && onRetry;

  return (
    <div 
      className={`
        border-l-4 p-4 mb-4 rounded-r
        ${isRetryable 
          ? 'bg-yellow-50 border-yellow-400' 
          : 'bg-red-50 border-red-400'
        }
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          {isRetryable ? (
            <svg 
              className="h-5 w-5 text-yellow-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          ) : (
            <svg 
              className="h-5 w-5 text-red-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>

        {/* Error Content */}
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${isRetryable ? 'text-yellow-800' : 'text-red-800'}`}>
                {isRetryable ? 'Temporary Error' : 'Error'}
              </h3>
              <div className={`mt-1 text-sm ${isRetryable ? 'text-yellow-700' : 'text-red-700'}`}>
                {error.message}
              </div>
              {error.code && (
                <div className={`mt-1 text-xs ${isRetryable ? 'text-yellow-600' : 'text-red-600'}`}>
                  Error Code: {error.code}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`
                  ml-3 flex-shrink-0 inline-flex rounded-md p-1.5 
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isRetryable 
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' 
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }
                `}
                aria-label="Dismiss error"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Retry Button */}
          {isRetryable && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="
                  inline-flex items-center px-3 py-1.5 border border-transparent 
                  text-xs font-medium rounded shadow-sm text-white 
                  bg-yellow-600 hover:bg-yellow-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="Retry loading data"
              >
                {isRetrying ? (
                  <>
                    <svg 
                      className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg 
                      className="-ml-0.5 mr-2 h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Try Again
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
