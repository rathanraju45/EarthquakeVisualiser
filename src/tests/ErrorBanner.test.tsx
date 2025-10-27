/**
 * @fileoverview Error Banner Component Tests
 * Tests error display, retry functionality, and dismiss behavior.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from '../components/ErrorBanner';
import type { ErrorInfo } from '../context/EarthquakeContext';

describe('ErrorBanner', () => {
  const retryableError: ErrorInfo = {
    message: 'Network error. Please check your internet connection.',
    code: 'NETWORK_ERROR',
    isRetryable: true,
  };

  const nonRetryableError: ErrorInfo = {
    message: 'Invalid request to USGS API.',
    code: 'BAD_REQUEST',
    isRetryable: false,
  };

  it('renders error message correctly', () => {
    render(<ErrorBanner error={retryableError} />);
    expect(screen.getByText('Network error. Please check your internet connection.')).toBeInTheDocument();
    expect(screen.getByText('Error Code: NETWORK_ERROR')).toBeInTheDocument();
  });

  it('shows retry button for retryable errors', () => {
    const mockRetry = jest.fn();
    render(<ErrorBanner error={retryableError} onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry loading data/i });
    expect(retryButton).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button for non-retryable errors', () => {
    render(<ErrorBanner error={nonRetryableError} />);
    expect(screen.queryByRole('button', { name: /retry loading data/i })).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const mockDismiss = jest.fn();
    render(<ErrorBanner error={retryableError} onDismiss={mockDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    fireEvent.click(dismissButton);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when retrying', () => {
    const mockRetry = jest.fn();
    render(<ErrorBanner error={retryableError} onRetry={mockRetry} isRetrying={true} />);
    
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /retry loading data/i });
    expect(retryButton).toBeDisabled();
  });

  it('uses yellow styling for retryable errors', () => {
    render(<ErrorBanner error={retryableError} onRetry={jest.fn()} />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-yellow-50');
    expect(banner).toHaveClass('border-yellow-400');
  });

  it('uses red styling for non-retryable errors', () => {
    render(<ErrorBanner error={nonRetryableError} />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-red-50');
    expect(banner).toHaveClass('border-red-400');
  });
});
