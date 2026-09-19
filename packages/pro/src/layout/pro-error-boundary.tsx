import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@package/ui/button';

export interface ProErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

export interface ProErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable component-level Error Boundary for Pro layouts and cards.
 * Prevents isolated widget failures from taking down the entire application shell.
 */
export class ProErrorBoundary extends Component<ProErrorBoundaryProps, ProErrorBoundaryState> {
  public state: ProErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ProErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ProErrorBoundary] Uncaught view exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center my-6">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3 text-destructive">
            <AlertTriangleIcon className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {this.props.fallbackTitle || 'Component encountered an unexpected error'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {this.props.fallbackDescription || this.state.error?.message || 'An unhandled exception occurred in this view.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="mt-4 gap-2 text-xs"
          >
            <RotateCcwIcon className="size-3.5" />
            Retry View
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
