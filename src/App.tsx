import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IntegrationsList } from './pages/IntegrationsList';
import { IntegrationDetail } from './pages/IntegrationDetail';
import { Logs } from './pages/Logs';
import { SyncHistoryDetail } from './pages/SyncHistoryDetail';
import { Conflicts } from './pages/Conflicts';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ErrorBoundary><IntegrationsList /></ErrorBoundary>} />
          <Route path="/integrations/:id" element={<ErrorBoundary><IntegrationDetail /></ErrorBoundary>} />
          <Route path="/logs" element={<ErrorBoundary><Logs /></ErrorBoundary>} />
          <Route path="/logs/:eventId" element={<ErrorBoundary><SyncHistoryDetail /></ErrorBoundary>} />
          <Route path="/conflicts" element={<ErrorBoundary><Conflicts /></ErrorBoundary>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
