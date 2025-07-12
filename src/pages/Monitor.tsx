import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Thermometer, Zap, Activity, Settings } from 'lucide-react';
import Temperature from './Temperature';
import Outlets from './Outlets';
import SystemHealth from './SystemHealth';
import HALPWM from './HALPWM';

const monitorTabs = [
  { name: 'Temperature', href: '/monitor/temperature', icon: Thermometer },
  { name: 'Smart Outlets', href: '/monitor/outlets', icon: Zap },
  { name: 'System Health', href: '/monitor/health', icon: Activity },
  { name: 'HAL PWM', href: '/monitor/hal', icon: Settings },
];

export default function Monitor() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
        <p className="text-gray-600 mt-2">Detailed monitoring and control panels</p>
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
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <Routes>
        <Route index element={<Navigate to="temperature" replace />} />
        <Route path="temperature" element={<Temperature />} />
        <Route path="outlets" element={<Outlets />} />
        <Route path="health" element={<SystemHealth />} />
        <Route path="hal" element={<HALPWM />} />
      </Routes>
    </div>
  );
}