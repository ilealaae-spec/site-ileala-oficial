import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

// Separate component to use hooks
function ErrorFallback({ error, errorInfo }: { error: Error | null; errorInfo: React.ErrorInfo | null }) {
  const { language } = useLanguage();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center w-full max-w-2xl p-8">
        <AlertTriangle
          size={48}
          className="text-destructive mb-6 flex-shrink-0"
        />

        <h2 className="text-2xl font-bold mb-2">
          {language === 'en' ? 'Something went wrong' : 'Algo deu errado'}
        </h2>
        
        <p className="text-muted-foreground mb-6 text-center">
          {language === 'en' 
            ? 'We apologize for the inconvenience. Please try reloading the page or return to the home page.'
            : 'Pedimos desculpas pelo inconveniente. Tente recarregar a página ou retorne à página inicial.'}
        </p>

        {isDevelopment && error && (
          <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
            <p className="text-sm font-semibold mb-2 text-destructive">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                {error.stack}
              </pre>
            )}
            {errorInfo && errorInfo.componentStack && (
              <details className="mt-4">
                <summary className="text-xs font-semibold cursor-pointer mb-2">
                  Component Stack
                </summary>
                <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:opacity-90 cursor-pointer"
            )}
          >
            <Home size={16} />
            {language === 'en' ? 'Go Home' : 'Ir para Início'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "border border-border bg-background",
              "hover:bg-muted cursor-pointer"
            )}
          >
            <RotateCcw size={16} />
            {language === 'en' ? 'Reload Page' : 'Recarregar Página'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to provide ErrorBoundary with hooks support
function ErrorBoundary({ children, fallback }: Props) {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
}

export default ErrorBoundary;
