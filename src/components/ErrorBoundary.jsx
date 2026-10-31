import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Caught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            কিছু একটা সমস্যা দেখা দিয়েছে (Page Recovery)
          </h2>
          <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
            কোনো সাময়িক ভুলের কারণে পেজটি লোড হতে পারেনি। নিচের বাটনে ক্লিক করে পোর্টালটি রিসেট করুন। আপনার সংরক্ষিত ডাটা সুরক্ষিত রয়েছে।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় লোড করুন (Reload)</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('bg_lockout_until');
                window.location.href = window.location.pathname;
              }}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 border border-slate-300 transition"
            >
              <Home className="w-4 h-4" />
              <span>হোম পেজে ফিরুন (Go Home)</span>
            </button>
          </div>
          {this.state.error && (
            <div className="mt-6 text-left max-w-lg w-full p-4 rounded-xl bg-slate-950 text-rose-300 font-mono text-[11px] overflow-auto border border-slate-800">
              <span className="text-slate-500 block mb-1 font-bold">Error Trace:</span>
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
