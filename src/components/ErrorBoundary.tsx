import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  panelName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Structured error logging for mission-critical telemetry
    console.error(`[CycloneShield ErrorBoundary] Exception in ${this.props.panelName || 'Component'}:`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-6 text-slate-100 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-2xl my-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-red-200">
            {this.props.fallbackTitle || 'Component Rendering Interrupted'}
          </h3>
          <p className="text-xs text-red-300/80 max-w-md mt-1 mb-3">
            {this.props.panelName ? `Panel [${this.props.panelName}] encountered an unhandled state.` : 'A safe fallback has been engaged to prevent app-wide disruption.'}
          </p>

          {this.state.error && (
            <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 text-left font-mono text-[11px] text-red-300 max-w-lg overflow-x-auto w-full mb-4">
              <span className="text-red-400 font-semibold">{this.state.error.name}: </span>
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Component
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Reload Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
