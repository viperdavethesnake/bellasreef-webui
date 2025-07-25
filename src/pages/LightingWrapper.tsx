import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sun, Settings, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNavigation from '../components/TabNavigation';
import Lighting from './Lighting';
import { ApiService } from '../services/api';

const lightingTabs = [
  { name: 'Control', href: '/lighting', icon: Sun },
  { name: 'Settings', href: '/settings/lighting', icon: Settings },
];

// Error Boundary Component
class LightingErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Lighting page crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600">
          <h2 className="text-2xl font-bold mb-2">Lighting Page Error</h2>
          <pre>{this.state.error?.toString()}</pre>
          <p>Check the browser console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function LightingWrapper() {
  const location = useLocation();
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'error' | 'warning' | 'unknown'>('unknown');
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        setStatusLoading(true);
        const response = await ApiService.getLightingStatus();
        // If we get a response, consider it healthy
        setServiceStatus('healthy');
      } catch (error) {
        console.error('Lighting service health check failed:', error);
        setServiceStatus('error');
      } finally {
        setStatusLoading(false);
      }
    };

    checkServiceHealth();
  }, []);

  const getStatusIcon = () => {
    if (statusLoading) return <Clock className="h-4 w-4 text-gray-400" />;
    
    switch (serviceStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (statusLoading) return 'Checking...';
    
    switch (serviceStatus) {
      case 'healthy':
        return 'Healthy';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (statusLoading) return 'bg-gray-100 text-gray-600 border-gray-200';
    
    switch (serviceStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <LightingErrorBoundary>
      <div className="space-y-6">
        <PageHeader
          title="Lighting System"
          description="Control and configure your aquarium lighting"
          statusIndicator={{
            status: statusLoading ? 'loading' : serviceStatus,
            text: getStatusText()
          }}
        />

        <TabNavigation tabs={lightingTabs} />
        
        <Routes>
          <Route index element={<Lighting />} />
        </Routes>
      </div>
    </LightingErrorBoundary>
  );
} 