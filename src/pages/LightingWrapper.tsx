import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Sun, Settings } from 'lucide-react';
import Lighting from './Lighting';
import LightingSettings from './LightingSettings';

const lightingTabs = [
  { name: 'Control', href: '/lighting', icon: Sun },
  { name: 'Settings', href: '/lighting/settings', icon: Settings },
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

  return (
    <LightingErrorBoundary>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lighting System</h1>
          <p className="text-gray-600 mt-2">Control and configure your aquarium lighting</p>
        </div>

        {/* Lighting Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {lightingTabs.map((tab) => {
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
          <Route index element={<Lighting />} />
          <Route path="settings" element={<LightingSettings />} />
        </Routes>
      </div>
    </LightingErrorBoundary>
  );
} 