import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon } from '../icons';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
         <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangleIcon className="flex-shrink-0" size={24} />
            <div className="text-sm">
                <p className="font-bold">Algo salió mal.</p>
                <p>No se pudo cargar este componente.</p>
            </div>
         </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;