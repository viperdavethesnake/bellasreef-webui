import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Thermometer, Cpu, Settings, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNavigation from '../components/TabNavigation';
import TelemetryTemperature from './TelemetryTemperature';
import TelemetryPWM from './TelemetryPWM';
import { ApiService } from '../services/api';

const telemetryTabs = [
  { name: 'Temperature', href: '/telemetry/temperature', icon: Thermometer, description: 'Temperature telemetry and monitoring' },
  { name: 'PWM', href: '/telemetry/pwm', icon: Cpu, description: 'PWM telemetry and control' },
  { name: 'Settings', href: '/settings/telemetry', icon: Settings, description: 'Telemetry system configuration' },
];

export default function TelemetryWrapper() {
  const location = useLocation();
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'error' | 'warning' | 'unknown'>('unknown');
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        setStatusLoading(true);
        // For telemetry, we'll simulate a health check since it's WIP
        // In the future, this would call a real telemetry health endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        setServiceStatus('healthy');
      } catch (error) {
        console.error('Telemetry service health check failed:', error);
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
        title="Telemetry System"
        description="Data collection, monitoring, and system telemetry"
        statusIndicator={{
          status: statusLoading ? 'loading' : serviceStatus,
          text: getStatusText()
        }}
      />

      <TabNavigation tabs={telemetryTabs} />

      <Routes>
        <Route index element={<TelemetryTemperature />} />
        <Route path="temperature" element={<TelemetryTemperature />} />
        <Route path="pwm" element={<TelemetryPWM />} />
      </Routes>
    </div>
  );
} 