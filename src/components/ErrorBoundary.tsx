import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class FlowchartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 Flowchart Error:', error);
    console.error('📋 Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // TODO: Enviar para serviço de monitoramento (Sentry, LogRocket, etc)
    // sendToErrorTracking(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20">
          <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Algo deu errado
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ocorreu um erro ao renderizar o fluxograma
              </p>
              
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Detalhes do erro
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de fallback personalizado
export const FlowchartErrorFallback: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center p-8">
      <div className="text-6xl mb-4">🔧</div>
      <h3 className="text-xl font-semibold mb-2">Erro no Fluxograma</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Não foi possível carregar este componente
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Recarregar
      </button>
    </div>
  </div>
);
