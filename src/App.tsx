import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
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
          <Route path="/" element={<IntegrationsList />} />
          <Route path="/integrations/:id" element={<IntegrationDetail />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/logs/:eventId" element={<SyncHistoryDetail />} />
          <Route path="/conflicts" element={<Conflicts />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
