
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangleIcon } from "./icons";
import Button from "./ui/Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
        if (this.props.fallback) return this.props.fallback;
        
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <AlertTriangleIcon size={48} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
                <p className="text-slate-400 max-w-md mb-6">
                    Ha ocurrido un error inesperado en este componente. Hemos registrado el problema.
                </p>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 w-full max-w-md mb-6 text-left overflow-auto max-h-32">
                     <code className="text-xs text-red-300 font-mono">{this.state.error?.message}</code>
                </div>
                <Button onClick={() => this.setState({ hasError: false, error: null })} variant="secondary">
                    Intentar de nuevo
                </Button>
            </div>
        );
    }

    return this.props.children;
  }
}
