import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { 
  Thermometer, 
  Zap, 
  Activity, 
  Settings, 
  Sun,
  Gauge,
  Cpu,
  Droplets
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNavigation from '../components/TabNavigation';
import ProbeMonitor from './ProbeMonitor';
import Outlets from './Outlets';
import SystemHealth from './SystemHealth';
import HALPWM from './HALPWM';
import FlowWrapper from './FlowWrapper';

const monitorTabs = [
  { name: 'Probes', href: '/monitor/probes', icon: Thermometer, description: 'Temperature probes and sensors' },
  { name: 'Outlets', href: '/monitor/outlets', icon: Zap, description: 'Smart outlets and power consumption' },
  { name: 'PWM', href: '/monitor/pwm', icon: Cpu, description: 'PWM control panels' },
  { name: 'Flow', href: '/monitor/flow', icon: Droplets, description: 'Flow control and monitoring' },
];

export default function Monitor() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Monitor"
        description="Real-time monitoring and system control"
      />

      <TabNavigation tabs={monitorTabs} />

      <Routes>
        <Route index element={<ProbeMonitor />} />
        <Route path="probes" element={<ProbeMonitor />} />
        <Route path="outlets" element={<Outlets />} />
        <Route path="pwm" element={<HALPWM />} />
        <Route path="flow/*" element={<FlowWrapper />} />
      </Routes>
    </div>
  );
}