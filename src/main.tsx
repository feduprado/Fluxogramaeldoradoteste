import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FlowchartErrorBoundary } from './components/FlowchartErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <FlowchartErrorBoundary>
    <App />
  </FlowchartErrorBoundary>
);
