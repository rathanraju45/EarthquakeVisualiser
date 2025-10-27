/**
 * @fileoverview USGS Earthquake Data Service
 * Handles fetching and parsing earthquake data from the USGS GeoJSON feed.
 * Implements in-memory caching with configurable TTL to reduce API calls.
 * Includes comprehensive error handling with retry logic and detailed error messages.
 * @module services/usgs
 */

import axios, { AxiosError } from 'axios';
import type { Earthquake, EarthquakeFeed } from '../types/earthquake';

/**
 * USGS GeoJSON feed URL for all earthquakes in the past 24 hours.
 * Updated every 5 minutes by USGS.
 * @see https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
 */
const USGS_ALL_DAY = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

/**
 * In-memory cache storage for earthquake feed data.
 * Maps URL keys to cached feed data with timestamp and TTL.
 */
const cache = new Map<string, { ts: number; ttl: number; data: EarthquakeFeed }>();

/**
 * Custom error class for USGS API errors.
 * Provides structured error information for better error handling.
 */
export class USGSError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'USGSError';
  }
}

/**
 * Extracts a user-friendly error message from various error types.
 * 
 * @param error - Error object from axios or other sources
 * @returns Structured error information
 */
function parseError(error: unknown): { message: string; code: string; statusCode?: number; isRetryable: boolean } {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network errors (no response received)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return {
          message: 'Request timed out. The USGS server is taking too long to respond.',
          code: 'TIMEOUT',
          isRetryable: true,
        };
      }
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('Network Error')) {
        return {
          message: 'Network error. Please check your internet connection.',
          code: 'NETWORK_ERROR',
          isRetryable: true,
        };
      }
      return {
        message: 'Unable to connect to USGS servers. Please try again later.',
        code: 'CONNECTION_ERROR',
        isRetryable: true,
      };
    }

    // HTTP error responses
    const status = axiosError.response.status;
    switch (status) {
      case 400:
        return {
          message: 'Invalid request to USGS API.',
          code: 'BAD_REQUEST',
          statusCode: status,
          isRetryable: false,
        };
      case 403:
        return {
          message: 'Access denied to USGS API.',
          code: 'FORBIDDEN',
          statusCode: status,
          isRetryable: false,
        };
      case 404:
        return {
          message: 'USGS data feed not found.',
          code: 'NOT_FOUND',
          statusCode: status,
          isRetryable: false,
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          statusCode: status,
          isRetryable: true,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'USGS server error. Please try again in a few minutes.',
          code: 'SERVER_ERROR',
          statusCode: status,
          isRetryable: true,
        };
      default:
        return {
          message: `HTTP error ${status}: ${axiosError.message}`,
          code: 'HTTP_ERROR',
          statusCode: status,
          isRetryable: status >= 500,
        };
    }
  }

  // Non-axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      isRetryable: false,
    };
  }

  return {
    message: 'An unexpected error occurred while fetching earthquake data.',
    code: 'UNKNOWN_ERROR',
    isRetryable: false,
  };
}

/**
 * Fetches earthquake data from the USGS GeoJSON feed with caching and retry logic.
 * Returns cached data if available and not expired, otherwise fetches fresh data.
 * 
 * @param ttlMs - Time-to-live for cached data in milliseconds (default: 5 minutes)
 * @param retries - Number of retry attempts for retryable errors (default: 2)
 * @returns Promise resolving to earthquake feed data
 * @throws {USGSError} If the API request fails after all retries or returns invalid data
 * 
 * @example
 * ```typescript
 * try {
 *   // Fetch with default 5-minute cache and 2 retries
 *   const feed = await fetchEarthquakes();
 *   console.log(`Found ${feed.quakes.length} earthquakes`);
 * } catch (error) {
 *   if (error instanceof USGSError) {
 *     console.error(`Error ${error.code}: ${error.message}`);
 *     if (error.isRetryable) {
 *       // Could retry later
 *     }
 *   }
 * }
 * 
 * // Fetch with custom settings
 * const feed = await fetchEarthquakes(10 * 60 * 1000, 3);
 * ```
 */
export async function fetchEarthquakes(ttlMs = 5 * 60 * 1000, retries = 2): Promise<EarthquakeFeed> {
  const key = USGS_ALL_DAY;
  const now = Date.now();
  const cached = cache.get(key);
  
  // Return cached data if still valid
  if (cached && now - cached.ts < cached.ttl) {
    return cached.data;
  }

  let lastError: USGSError | null = null;
  
  // Retry logic for transient errors
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Fetch fresh data from USGS API
      const resp = await axios.get(USGS_ALL_DAY, { 
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      
      const data = resp.data;
      
      // Validate GeoJSON structure
      if (!data || typeof data !== 'object') {
        throw new USGSError(
          'Invalid response format from USGS API.',
          'INVALID_FORMAT',
          undefined,
          false
        );
      }
      
      if (data.type !== 'FeatureCollection') {
        throw new USGSError(
          'Response is not a valid GeoJSON FeatureCollection.',
          'INVALID_GEOJSON',
          undefined,
          false
        );
      }
      
      if (!Array.isArray(data.features)) {
        throw new USGSError(
          'GeoJSON features array is missing or invalid.',
          'INVALID_FEATURES',
          undefined,
          false
        );
      }

      // Parse and transform GeoJSON features into Earthquake objects
      const quakes: Earthquake[] = data.features
        .map((f: any) => {
          try {
            const [longitude, latitude, depth] = f.geometry?.coordinates || [];
            const {
              mag: magnitude = 0,
              place = 'Unknown',
              time = 0,
              url = '',
            } = f.properties || {};

            return {
              id: f.id ?? `${latitude},${longitude},${time}`,
              latitude: Number(latitude),
              longitude: Number(longitude),
              depth: Number(depth),
              magnitude: Number(magnitude),
              place: String(place),
              time: Number(time),
              url: String(url),
              raw: f,
            } as Earthquake;
          } catch (parseError) {
            // Skip malformed features but log them
            console.warn('Failed to parse earthquake feature:', parseError);
            return null;
          }
        })
        .filter((q: Earthquake | null): q is Earthquake => 
          q !== null && Number.isFinite(q.latitude) && Number.isFinite(q.longitude)
        );

      // Build feed object with metadata
      const feed: EarthquakeFeed = {
        metadata: {
          generated: data.metadata?.generated ?? Date.now(),
          url: USGS_ALL_DAY,
          title: data.metadata?.title ?? 'USGS All Day',
          count: quakes.length,
        },
        quakes,
      };

      // Store in cache
      cache.set(key, { ts: now, ttl: ttlMs, data: feed });
      return feed;
      
    } catch (error) {
      const errorInfo = parseError(error);
      lastError = new USGSError(
        errorInfo.message,
        errorInfo.code,
        errorInfo.statusCode,
        errorInfo.isRetryable
      );

      // If error is not retryable or this is the last attempt, throw
      if (!errorInfo.isRetryable || attempt === retries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // Should never reach here, but throw last error if it does
  throw lastError || new USGSError(
    'Failed to fetch earthquake data after all retries.',
    'MAX_RETRIES_EXCEEDED',
    undefined,
    false
  );
}

/**
 * Clears all cached earthquake data.
 * Useful for forcing a fresh fetch on the next request.
 * 
 * @example
 * ```typescript
 * invalidateCache();
 * const freshData = await fetchEarthquakes();
 * ```
 */
export function invalidateCache() {
  cache.clear();
}
