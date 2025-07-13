'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to external service in production
    this.logErrorToService(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.error('Error logged to service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        level: this.props.level || 'component',
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private getErrorMessage(): string {
    const { error } = this.state;
    if (!error) return 'An unexpected error occurred';
    
    // Provide user-friendly error messages
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. Please refresh the page.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (error.message.includes('TypeError')) {
      return 'A data processing error occurred. Please try again.';
    }
    
    return process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong. Please try again.';
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      const isPageLevel = this.props.level === 'page';
      const isCritical = this.props.level === 'critical';

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            isPageLevel 
              ? 'min-h-screen flex items-center justify-center bg-gray-50' 
              : 'p-6 bg-red-50 border border-red-200 rounded-lg'
          }`}
        >
          <div className={`text-center ${isPageLevel ? 'max-w-md' : 'max-w-sm'}`}>
            <div className={`${
              isCritical ? 'text-6xl' : isPageLevel ? 'text-5xl' : 'text-3xl'
            } mb-4`}>
              {isCritical ? '🚨' : isPageLevel ? '💥' : '⚠️'}
            </div>
            
            <h2 className={`${
              isPageLevel ? 'text-2xl' : 'text-lg'
            } font-bold text-gray-900 mb-2`}>
              {isCritical ? 'Critical Error' : isPageLevel ? 'Oops! Something went wrong' : 'Error'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {this.getErrorMessage()}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className={`space-y-3 ${isPageLevel ? 'space-x-0' : 'flex space-x-3 space-y-0'}`}>
              <button
                onClick={this.handleRetry}
                className={`${
                  isPageLevel ? 'w-full' : 'flex-1'
                } bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors`}
              >
                Try Again
              </button>
              
              {isPageLevel && (
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>

            {!isPageLevel && (
              <div className="mt-3 text-xs text-gray-500">
                Error ID: {this.state.errorId}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Specialized error boundaries for different use cases
export function PageErrorBoundary({ children, onError }: { children: ReactNode; onError?: Props['onError'] }) {
  return (
    <ErrorBoundary level="page" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, onError }: { children: ReactNode; onError?: Props['onError'] }) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

export function CriticalErrorBoundary({ children, onError }: { children: ReactNode; onError?: Props['onError'] }) {
  return (
    <ErrorBoundary level="critical" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

// Hook for throwing errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error('Manual error triggered:', error, errorInfo);
    throw error;
  };
}