# Error Handling Documentation

## Overview

The Earthquake Visualizer implements comprehensive error handling for all API-related errors and user interactions. The error handling system is designed to:

- Provide clear, user-friendly error messages
- Distinguish between temporary and permanent errors
- Offer retry capabilities for transient failures
- Log errors for debugging while showing clean messages to users
- Handle network issues, timeouts, and API failures gracefully

## Error Architecture

### 1. Service Layer (`src/services/usgs.ts`)

#### Custom Error Class: `USGSError`

```typescript
class USGSError extends Error {
  constructor(
    message: string,
    code: string,
    statusCode?: number,
    isRetryable: boolean = false
  )
}
```

**Properties:**
- `message`: User-friendly error description
- `code`: Machine-readable error code (e.g., `NETWORK_ERROR`, `TIMEOUT`)
- `statusCode`: HTTP status code if applicable
- `isRetryable`: Whether the operation can be retried

#### Error Categories

**Network Errors (Retryable):**
- `TIMEOUT`: Request exceeded 15-second timeout
- `NETWORK_ERROR`: No internet connection or network failure
- `CONNECTION_ERROR`: Unable to reach USGS servers

**HTTP Errors:**
- `BAD_REQUEST` (400): Invalid request - Not retryable
- `FORBIDDEN` (403): Access denied - Not retryable
- `NOT_FOUND` (404): Resource not found - Not retryable
- `RATE_LIMIT` (429): Too many requests - Retryable
- `SERVER_ERROR` (500-504): USGS server issues - Retryable

**Data Errors (Not Retryable):**
- `INVALID_FORMAT`: Response is not valid JSON
- `INVALID_GEOJSON`: Response is not a GeoJSON FeatureCollection
- `INVALID_FEATURES`: Features array is missing or malformed

#### Retry Logic

The `fetchEarthquakes` function implements automatic retry with exponential backoff:

```typescript
fetchEarthquakes(ttlMs = 5 * 60 * 1000, retries = 2)
```

- **Default retries:** 2 attempts
- **Backoff strategy:** Exponential (1s, 2s, max 5s)
- **Only retries:** Errors marked as `isRetryable: true`
- **Cache:** Successful responses cached to reduce load

**Example:**
```typescript
try {
  const feed = await fetchEarthquakes();
} catch (error) {
  if (error instanceof USGSError) {
    console.error(`${error.code}: ${error.message}`);
    if (error.isRetryable) {
      // User can retry
    }
  }
}
```

### 2. Context Layer (`src/context/EarthquakeContext.tsx`)

#### Error State Management

The context maintains structured error information:

```typescript
type ErrorInfo = {
  message: string;
  code?: string;
  isRetryable: boolean;
}
```

#### Context Methods

**`refresh()`**: Fetches data and handles all errors
- Clears previous errors
- Catches `USGSError` and generic errors
- Updates error state with structured information
- Logs errors to console for debugging

**`clearError()`**: Dismisses the current error
- Allows users to manually clear error banners

### 3. UI Layer (`src/components/ErrorBanner.tsx`)

#### Error Banner Component

Visual error display with different styles for error types:

**Retryable Errors (Yellow):**
- Warning icon
- "Temporary Error" heading
- Yellow background (`bg-yellow-50`)
- "Try Again" button with retry callback
- Shows spinner during retry

**Non-Retryable Errors (Red):**
- Error icon
- "Error" heading
- Red background (`bg-red-50`)
- No retry button
- Dismiss button only

#### Accessibility Features

- `role="alert"` for screen readers
- `aria-live="assertive"` for immediate announcement
- `aria-label` on all buttons
- Keyboard accessible (focus management)
- Color is not the only indicator (icons + text)

## Usage Examples

### Basic Error Display

```tsx
function MyComponent() {
  const { error, refresh, clearError, loading } = useEarthquakes();

  return (
    <div>
      {error && (
        <ErrorBanner 
          error={error}
          onRetry={refresh}
          onDismiss={clearError}
          isRetrying={loading}
        />
      )}
    </div>
  );
}
```

### Conditional Retry

```tsx
{error && error.isRetryable && (
  <button onClick={refresh}>Try Again</button>
)}
```

### Error Logging

```tsx
const refresh = async () => {
  try {
    const result = await fetchEarthquakes();
    // Success
  } catch (e) {
    console.error('Failed to fetch:', e);
    if (e instanceof USGSError) {
      console.error(`Error code: ${e.code}, Retryable: ${e.isRetryable}`);
    }
  }
};
```

## Testing

### Error Banner Tests (`src/tests/ErrorBanner.test.tsx`)

Tests cover:
- ✅ Error message display
- ✅ Retry button for retryable errors
- ✅ No retry button for non-retryable errors
- ✅ Dismiss functionality
- ✅ Loading state during retry
- ✅ Correct styling (yellow vs red)

### Integration Testing

To test error handling manually:

1. **Network Error:** Disconnect internet and click Refresh
2. **Timeout:** Throttle network to very slow speeds
3. **Invalid URL:** Modify USGS URL in code temporarily
4. **Rate Limiting:** Make many rapid requests

## Error Messages Reference

| Code | Message | Retryable | User Action |
|------|---------|-----------|-------------|
| `TIMEOUT` | Request timed out. The USGS server is taking too long to respond. | ✅ | Wait and retry |
| `NETWORK_ERROR` | Network error. Please check your internet connection. | ✅ | Check connection |
| `CONNECTION_ERROR` | Unable to connect to USGS servers. Please try again later. | ✅ | Wait and retry |
| `BAD_REQUEST` | Invalid request to USGS API. | ❌ | Contact support |
| `FORBIDDEN` | Access denied to USGS API. | ❌ | Contact support |
| `NOT_FOUND` | USGS data feed not found. | ❌ | Contact support |
| `RATE_LIMIT` | Too many requests. Please wait a moment and try again. | ✅ | Wait then retry |
| `SERVER_ERROR` | USGS server error. Please try again in a few minutes. | ✅ | Wait and retry |
| `INVALID_FORMAT` | Invalid response format from USGS API. | ❌ | Contact support |
| `INVALID_GEOJSON` | Response is not a valid GeoJSON FeatureCollection. | ❌ | Contact support |

## Best Practices

### For Developers

1. **Always use USGSError** for API-related errors
2. **Set isRetryable correctly** - only for transient issues
3. **Provide clear messages** - tell users what happened and what to do
4. **Log technical details** - use console.error for debugging
5. **Test error paths** - simulate failures in tests

### For Users

1. **Retryable errors** - Click "Try Again" after a moment
2. **Network errors** - Check your internet connection
3. **Server errors** - Wait a few minutes then retry
4. **Persistent errors** - Clear browser cache or contact support

## Future Enhancements

Potential improvements:

- [ ] Error toast notifications (auto-dismiss after delay)
- [ ] Offline mode with service worker
- [ ] Error analytics/reporting
- [ ] Retry with exponential backoff in UI
- [ ] Fallback to cached data when offline
- [ ] Error boundary for React component errors
- [ ] Sentry or error tracking integration
