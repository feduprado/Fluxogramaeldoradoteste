import React from 'react';

interface FlowchartErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

interface FlowchartErrorBoundaryProps {
  children: React.ReactNode;
}

interface FlowchartErrorFallbackProps {
  onRetry: () => void;
  error?: Error | null;
}

const FlowchartErrorFallback: React.FC<FlowchartErrorFallbackProps> = ({ onRetry, error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center">
    <div className="max-w-md space-y-4">
      <div className="text-4xl">🛠️</div>
      <h1 className="text-2xl font-semibold">Algo deu errado no fluxograma</h1>
      <p className="text-gray-300 text-sm">
        Detectamos um problema e pausamos o aplicativo para evitar perda de dados. Você pode tentar recarregar a aplicação.
      </p>
      {error && (
        <pre className="bg-black/40 rounded-lg p-3 text-left text-xs overflow-x-auto">
          {error.message}
        </pre>
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={onRetry}
          className="bg-purple-600 hover:bg-purple-500 transition-colors rounded-lg px-4 py-2 font-medium"
        >
          Tentar novamente
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-4 py-2 text-sm"
        >
          Recarregar página
        </button>
      </div>
    </div>
  </div>
);

export class FlowchartErrorBoundary extends React.Component<FlowchartErrorBoundaryProps, FlowchartErrorBoundaryState> {
  state: FlowchartErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): FlowchartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Flowchart Error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <FlowchartErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
    }

    return this.props.children;
  }
}
