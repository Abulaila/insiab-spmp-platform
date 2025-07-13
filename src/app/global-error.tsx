'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      const errorData = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      };
      
      console.error('Global error logged:', errorData);
    }
  }, [error]);

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const getErrorMessage = () => {
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. This usually happens after an update.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (error.message.includes('TypeError')) {
      return 'A critical data processing error occurred.';
    }
    
    return process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'A critical error occurred that prevented the application from working properly.';
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-6">🚨</div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Critical System Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Technical Details (Development)
              </summary>
              <div className="p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try to Recover
            </button>
            
            <button
              onClick={handleReload}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            If this error persists, please contact support.
          </div>
        </motion.div>
      </body>
    </html>
  );
}