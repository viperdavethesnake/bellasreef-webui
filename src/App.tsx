import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Monitor from './pages/Monitor';
import Settings from './pages/Settings';
import LightingWrapper from './pages/LightingWrapper';
import FlowWrapper from './pages/FlowWrapper';
import TelemetryWrapper from './pages/TelemetryWrapper';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor/*" element={<Monitor />} />
          <Route path="lighting/*" element={<LightingWrapper />} />
          <Route path="flow/*" element={<FlowWrapper />} />
          <Route path="telemetry/*" element={<TelemetryWrapper />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; 