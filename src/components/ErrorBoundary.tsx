import { Component, ErrorInfo, ReactNode } from "react";
import { Home, RefreshCw, Bug } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = "#/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Bug className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground mb-2">Ocorreu um erro inesperado. Lamentamos o inconveniente.</p>
            {this.state.error && (
              <pre className="text-xs text-muted-foreground/60 bg-muted/30 rounded-xl p-3 mb-6 overflow-auto max-h-32 text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 h-9 rounded-xl text-xs font-medium border border-border bg-background hover:bg-muted px-4 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Tentar novamente
              </button>
              <Link to="/dashboard">
                <button className="inline-flex items-center gap-2 h-9 rounded-xl text-xs font-semibold gradient-gold text-primary-foreground px-4 hover:opacity-90 transition-opacity">
                  <Home className="h-3.5 w-3.5" />
                  Ir para o Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
