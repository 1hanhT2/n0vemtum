
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
              {this.state.error && (
                <details className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                  <code className="text-red-600 dark:text-red-400 block whitespace-pre-wrap">
                    {this.state.error.message}
                  </code>
                </details>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.resetError} className="flex-1" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        Something went wrong in this section
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={resetError} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}
