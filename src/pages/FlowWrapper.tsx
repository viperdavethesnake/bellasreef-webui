import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Activity, Settings, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNavigation from '../components/TabNavigation';
import Flow from './Flow';
import { ApiService } from '../services/api';

const flowTabs = [
  { name: 'Control', href: '/flow/control', icon: Activity, description: 'Flow control and monitoring' },
  { name: 'Settings', href: '/settings/flow', icon: Settings, description: 'Flow system configuration' },
];

export default function FlowWrapper() {
  const location = useLocation();
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'error' | 'warning' | 'unknown'>('unknown');
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        setStatusLoading(true);
        const response = await ApiService.getFlowStatus();
        // If we get a response, consider it healthy
        setServiceStatus('healthy');
      } catch (error) {
        console.error('Flow service health check failed:', error);
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
    <div className="space-y-6">
      <PageHeader
        title="Flow Management"
        description="Control circulation pumps and configure flow settings"
        statusIndicator={{
          status: statusLoading ? 'loading' : serviceStatus,
          text: getStatusText()
        }}
      />

      <TabNavigation tabs={flowTabs} />

      <Routes>
        <Route index element={<Flow />} />
        <Route path="control" element={<Flow />} />
      </Routes>
    </div>
  );
} 