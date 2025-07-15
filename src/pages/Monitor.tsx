import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Thermometer, 
  Zap, 
  Activity, 
  Settings, 
  Sun,
  Gauge
} from 'lucide-react';
import ProbeMonitor from './ProbeMonitor';
import Outlets from './Outlets';
import SystemHealth from './SystemHealth';
import HALPWM from './HALPWM';

const monitorTabs = [
  { name: 'Probes', href: '/monitor/probes', icon: Thermometer, description: 'Temperature probes and sensors' },
  { name: 'Power', href: '/monitor/power', icon: Zap, description: 'Smart outlets and power consumption' },
  { name: 'System', href: '/monitor/system', icon: Activity, description: 'System health and performance' },
  { name: 'Control', href: '/monitor/control', icon: Settings, description: 'Manual control panels' },
];

export default function Monitor() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
        <p className="text-gray-600 mt-2">Real-time monitoring and system control</p>
      </div>

      {/* Monitor Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {monitorTabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route index element={<ProbeMonitor />} />
        <Route path="probes" element={<ProbeMonitor />} />
        <Route path="power" element={<Outlets />} />
        <Route path="system" element={<SystemHealth />} />
        <Route path="control" element={<HALPWM />} />
      </Routes>
    </div>
  );
}