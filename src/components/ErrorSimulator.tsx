/**
 * @fileoverview Error Simulator Component (Development Only)
 * Provides UI controls to simulate various error scenarios for testing.
 * This component should ONLY be used in development mode.
 * @module components/ErrorSimulator
 */

import React, { useState } from 'react';
import axios from 'axios';

/**
 * Error Simulator Component
 * 
 * A development-only tool for testing error handling.
 * Provides buttons to simulate various error scenarios:
 * - Network errors
 * - Timeouts
 * - HTTP errors (404, 500, 429)
 * - Invalid data responses
 * 
 * Usage: Only render this in development mode
 * 
 * @example
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <ErrorSimulator />}
 * ```
 */
export default function ErrorSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const simulateError = async (type: string) => {
    const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
    
    try {
      switch (type) {
        case 'network':
          showMessage('Simulating network error...');
          // Make request to non-existent domain
          await axios.get('https://this-domain-does-not-exist-12345.com/data.json', { timeout: 5000 });
          break;
          
        case 'timeout':
          showMessage('Simulating timeout (this will take 20 seconds)...');
          // Set very short timeout
          await axios.get(USGS_URL, { timeout: 1 });
          break;
          
        case '404':
          showMessage('Simulating 404 error...');
          // Request non-existent endpoint
          await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/INVALID.geojson');
          break;
          
        case '500':
          showMessage('Cannot directly simulate 500 error from client. Use browser DevTools network tab to mock the response.');
          break;
          
        case '429':
          showMessage('Cannot directly simulate 429 error. Make many rapid requests to trigger rate limiting.');
          break;
          
        case 'invalid':
          showMessage('To test invalid data, temporarily modify the USGS URL in usgs.ts');
          break;
          
        case 'offline':
          showMessage('Open DevTools (F12) → Network tab → Set to "Offline" → Click Refresh in the app');
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error simulated successfully:', error);
      showMessage('Check the error banner in the app!');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-purple-600 text-white px-3 py-2 rounded-full shadow-lg z-[2000] text-xs font-medium hover:bg-purple-700"
        title="Open Error Simulator (Dev Tool)"
      >
        🔧 Test Errors
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl z-[2000] w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">⚠️ Error Simulator</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      {message && (
        <div className="mb-3 p-2 bg-blue-900 text-blue-100 rounded text-xs">
          {message}
        </div>
      )}

      <div className="space-y-2 text-xs">
        <div className="text-gray-400 mb-2">Click to simulate errors:</div>

        <button
          onClick={() => simulateError('network')}
          className="block w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-left"
        >
          🌐 Network Error
        </button>

        <button
          onClick={() => simulateError('timeout')}
          className="block w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-left"
        >
          ⏱️ Timeout (20s)
        </button>

        <button
          onClick={() => simulateError('404')}
          className="block w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-left"
        >
          ❌ 404 Not Found
        </button>

        <button
          onClick={() => simulateError('500')}
          className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-left"
        >
          ⚙️ 500 Server Error
        </button>

        <button
          onClick={() => simulateError('429')}
          className="block w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-left"
        >
          🚫 429 Rate Limit
        </button>

        <button
          onClick={() => simulateError('offline')}
          className="block w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-left"
        >
          📴 Offline Mode
        </button>

        <button
          onClick={() => simulateError('invalid')}
          className="block w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-left"
        >
          📋 Invalid Data
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        💡 Some errors require DevTools or code changes to simulate properly.
      </div>
    </div>
  );
}
