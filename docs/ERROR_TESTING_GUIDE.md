# Error Simulation & Testing Guide

This guide shows you how to simulate different error scenarios to test the error handling in the Earthquake Visualizer application.

## Method 1: Browser DevTools (Easiest)

### Simulate Network Errors

1. **Open Chrome DevTools** (F12 or Right-click → Inspect)
2. Go to the **Network** tab
3. Click the **throttling dropdown** (says "No throttling" by default)
4. Select an option:

   - **Offline**: Simulates no internet connection
   - **Slow 3G**: Simulates slow network (may cause timeout)
   - **Fast 3G**: Simulates moderate network

5. **Test Steps:**
   ```
   1. Set Network to "Offline"
   2. Click "Refresh" button in the app
   3. You should see: "Network error. Please check your internet connection."
   4. Yellow banner with "Try Again" button appears
   ```

### Block Specific Requests

1. In Chrome DevTools, go to **Network** tab
2. Right-click on the USGS API request
3. Select **Block request URL**
4. Refresh the page
5. You'll see a network error

### Simulate Slow Network (Timeout)

1. Go to **Network** tab
2. Click throttling dropdown
3. Select **Add...** → Create custom profile:
   - Download: 10 Kbps
   - Upload: 10 Kbps
   - Latency: 10000 ms
4. This will likely cause a timeout error

---

## Method 2: Temporarily Modify Code

### A. Simulate Invalid API URL (404 Error)

**File:** `src/services/usgs.ts`

```typescript
// TEMPORARY - Change this line (line ~18):
const USGS_ALL_DAY = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/INVALID_URL.geojson';

// Expected Error: "USGS data feed not found." (404)
// Don't forget to revert this change!
```

### B. Simulate Server Error (500)

Add a mock interceptor before making the request:

**File:** `src/services/usgs.ts`

```typescript
export async function fetchEarthquakes(ttlMs = 5 * 60 * 1000, retries = 2): Promise<EarthquakeFeed> {
  // TEMPORARY - Add this to force a 500 error
  throw new USGSError(
    'USGS server error. Please try again in a few minutes.',
    'SERVER_ERROR',
    500,
    true
  );
  
  // ... rest of the function
}
```

### C. Simulate Timeout

**File:** `src/services/usgs.ts`

```typescript
// TEMPORARY - Change timeout from 15000 to 100 (line ~170):
const resp = await axios.get(USGS_ALL_DAY, { 
  timeout: 100,  // Changed from 15000
  validateStatus: (status) => status >= 200 && status < 300,
});

// Expected Error: "Request timed out. The USGS server is taking too long to respond."
```

### D. Simulate Invalid Data

**File:** `src/services/usgs.ts`

```typescript
// TEMPORARY - Add after successful API call (around line 180):
const data = resp.data;

// Force invalid data structure
throw new USGSError(
  'Response is not a valid GeoJSON FeatureCollection.',
  'INVALID_GEOJSON',
  undefined,
  false
);

// ... rest of validation
```

---

## Method 3: Create Test Utilities

Create a temporary test component to trigger errors on demand:

**File:** `src/components/ErrorSimulator.tsx` (create this file)

```typescript
import React from 'react';
import { invalidateCache } from '../services/usgs';
import { useEarthquakes } from '../context/EarthquakeContext';

export default function ErrorSimulator() {
  const { refresh } = useEarthquakes();
  
  const simulateError = async (type: string) => {
    invalidateCache(); // Clear cache first
    
    // Temporarily override the fetch function
    const originalFetch = global.fetch;
    
    switch (type) {
      case 'network':
        global.fetch = () => Promise.reject(new Error('Network Error'));
        break;
      case 'timeout':
        global.fetch = () => new Promise(() => {}); // Never resolves
        break;
      case '404':
        global.fetch = () => Promise.resolve(new Response('Not Found', { status: 404 }));
        break;
      case '500':
        global.fetch = () => Promise.resolve(new Response('Server Error', { status: 500 }));
        break;
    }
    
    await refresh();
    
    // Restore original fetch
    setTimeout(() => {
      global.fetch = originalFetch;
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 right-20 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-[2000]">
      <h3 className="font-bold mb-2">Error Simulator</h3>
      <div className="space-y-2">
        <button onClick={() => simulateError('network')} className="block w-full px-3 py-1 bg-red-600 rounded">
          Network Error
        </button>
        <button onClick={() => simulateError('timeout')} className="block w-full px-3 py-1 bg-orange-600 rounded">
          Timeout
        </button>
        <button onClick={() => simulateError('404')} className="block w-full px-3 py-1 bg-yellow-600 rounded">
          404 Error
        </button>
        <button onClick={() => simulateError('500')} className="block w-full px-3 py-1 bg-blue-600 rounded">
          500 Error
        </button>
      </div>
    </div>
  );
}
```

**Then add to App.tsx** (temporarily):

```typescript
import ErrorSimulator from './components/ErrorSimulator';

// In AppInner component, add:
{process.env.NODE_ENV === 'development' && <ErrorSimulator />}
```

---

## Method 4: Browser Console Commands

Open browser console (F12 → Console tab) and run these commands:

### Clear Cache and Force Error
```javascript
// Access the context (if you expose it globally for debugging)
// Or simulate by disconnecting network in DevTools first, then:
document.querySelector('[aria-label="Refresh data"]').click();
```

### Manually Trigger Refresh
```javascript
// Find and click the refresh button
document.querySelector('button:contains("Refresh")').click();
```

---

## Method 5: Mock Service Worker (MSW) - Professional Approach

Install MSW for testing:

```bash
npm install --save-dev msw
```

**Create:** `src/mocks/handlers.ts`

```typescript
import { rest } from 'msw';

export const handlers = [
  // Simulate successful response
  rest.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ type: 'FeatureCollection', features: [] }));
  }),
];

// Error scenarios
export const errorHandlers = {
  networkError: rest.get('*/all_day.geojson', (req, res) => {
    return res.networkError('Network error');
  }),
  
  timeout: rest.get('*/all_day.geojson', (req, res, ctx) => {
    return res(ctx.delay('infinite'));
  }),
  
  notFound: rest.get('*/all_day.geojson', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ message: 'Not found' }));
  }),
  
  serverError: rest.get('*/all_day.geojson', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal server error' }));
  }),
  
  rateLimit: rest.get('*/all_day.geojson', (req, res, ctx) => {
    return res(ctx.status(429), ctx.json({ message: 'Too many requests' }));
  }),
  
  invalidData: rest.get('*/all_day.geojson', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ invalid: 'data' }));
  }),
};
```

---

## Testing Checklist

Use this checklist to verify all error types:

### ✅ Network Errors (Retryable)
- [ ] **Offline**: Set DevTools to Offline → Click Refresh
  - Expected: Yellow banner, "Network error. Please check your internet connection."
  - Has: "Try Again" button
  
- [ ] **Timeout**: Set very slow network → Click Refresh
  - Expected: Yellow banner, "Request timed out..."
  - Has: "Try Again" button

- [ ] **Connection Error**: Block USGS domain → Click Refresh
  - Expected: Yellow banner, "Unable to connect to USGS servers..."
  - Has: "Try Again" button

### ✅ HTTP Errors

- [ ] **404 Not Found**: Change URL to invalid → Click Refresh
  - Expected: Red banner, "USGS data feed not found."
  - No retry button

- [ ] **500 Server Error**: Mock 500 response
  - Expected: Yellow banner, "USGS server error..."
  - Has: "Try Again" button

- [ ] **429 Rate Limit**: Mock 429 response
  - Expected: Yellow banner, "Too many requests..."
  - Has: "Try Again" button

### ✅ Data Validation Errors

- [ ] **Invalid JSON**: Mock malformed response
  - Expected: Red banner, "Invalid response format..."
  - No retry button

- [ ] **Invalid GeoJSON**: Mock non-GeoJSON response
  - Expected: Red banner, "Response is not a valid GeoJSON..."
  - No retry button

### ✅ UI Behavior

- [ ] Error banner appears in desktop sidebar
- [ ] Error banner appears in mobile drawer
- [ ] Error banner appears at top on mobile
- [ ] "Try Again" button shows spinner when clicked
- [ ] "Try Again" button is disabled during retry
- [ ] Dismiss button clears the error
- [ ] Error is cleared on successful retry
- [ ] Error code is displayed
- [ ] Appropriate icon is shown (warning vs error)

---

## Quick Test Script

Run this in your browser console for a quick test:

```javascript
// Test 1: Go offline
console.log('Test 1: Simulating offline...');
// Manually set Network to Offline in DevTools, then click Refresh

setTimeout(() => {
  // Test 2: Check error banner exists
  const errorBanner = document.querySelector('[role="alert"]');
  console.log('Error banner found:', !!errorBanner);
  
  // Test 3: Check retry button
  const retryButton = document.querySelector('[aria-label="Retry loading data"]');
  console.log('Retry button found:', !!retryButton);
  
  // Test 4: Check dismiss button
  const dismissButton = document.querySelector('[aria-label="Dismiss error"]');
  console.log('Dismiss button found:', !!dismissButton);
}, 2000);
```

---

## Automated Testing

Run the test suite to verify error handling:

```bash
# Run all tests including error handling tests
npm test -- --watchAll=false

# Run only ErrorBanner tests
npm test -- ErrorBanner.test.tsx --watchAll=false

# Run with coverage
npm test -- --coverage --watchAll=false
```

**Expected output:**
```
Test Suites: 6 passed, 6 total
Tests:       15 passed, 15 total
```

---

## Debugging Tips

### View Console Errors
Errors are logged to console for debugging:
```javascript
// Open Console (F12)
// You'll see detailed error info:
Failed to fetch earthquake data: USGSError: Network error...
Error code: NETWORK_ERROR, Retryable: true
```

### React DevTools
Install React DevTools extension and inspect:
1. Find `EarthquakeProvider` in component tree
2. View state: `error`, `loading`, `feed`
3. Check error object structure

### Network Tab
1. Open DevTools → Network tab
2. Look for failed requests (red)
3. Click on request to see:
   - Status code
   - Response headers
   - Timing information

---

## Best Practices

1. **Always revert temporary code changes** after testing
2. **Test on multiple browsers** (Chrome, Firefox, Safari)
3. **Test on mobile devices** (use Chrome DevTools device mode)
4. **Test with screen readers** (VoiceOver on Mac, NVDA on Windows)
5. **Test keyboard navigation** (Tab through error banner, buttons)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Error doesn't appear | Check browser console for errors |
| Retry doesn't work | Make sure network is back online |
| Can't dismiss error | Check if `clearError` is wired up |
| Styling looks wrong | Clear browser cache, check Tailwind classes |
| Tests failing | Run `npm test` to see specific failures |

