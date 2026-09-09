import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Keep error logging clean and informative for debugging without leaking sensitive data
    if (process.env.NODE_ENV !== 'production') {
      console.error('[App Error Boundary Caught]:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 bg-[#f7faf9] dark:bg-[#181c1c] text-[#181c1c] dark:text-white rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-sm">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#98001b]/10 dark:bg-[#98001b]/20 text-[#98001b] dark:text-[#ffb3b0] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-['Montserrat'] font-black text-lg sm:text-xl text-[#181c1c] dark:text-white">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-urdu leading-relaxed">
                معذرت، اس سیکشن کو لوڈ کرنے میں عارضی رکاوٹ پیش آئی ہے۔ برائے مہربانی صفحہ دوبارہ لوڈ کریں یا ری سیٹ بٹن دبائیں۔
              </p>
              {this.props.fallbackMessage && (
                <p className="text-[11px] text-neutral-500 font-mono mt-1">
                  {this.props.fallbackMessage}
                </p>
              )}
            </div>

            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-left overflow-auto max-h-24 text-[10px] font-mono text-red-700 dark:text-red-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-[#98001b] hover:bg-[#be1e2d] text-white text-xs font-bold font-['Montserrat'] uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again (دوبارہ کوشش کریں)</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#98001b]" />
                <span>Reload App (صفحہ ریفریش کریں)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
