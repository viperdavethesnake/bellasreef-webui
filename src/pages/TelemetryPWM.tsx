import { useState, useEffect } from 'react';
import { Cpu, Activity, Gauge, Clock, AlertTriangle, Zap } from 'lucide-react';

interface PWMData {
  controllers: Array<{
    id: string;
    name: string;
    status: 'online' | 'offline';
    channels: Array<{
      id: string;
      name: string;
      intensity: number;
      power: number;
      temperature: number;
    }>;
  }>;
  totalPower: number;
  lastUpdate: string;
  alerts: string[];
}

export default function TelemetryPWM() {
  const [pwmData, setPwmData] = useState<PWMData>({
    controllers: [
      {
        id: 'pwm-1',
        name: 'Main PWM Controller',
        status: 'online',
        channels: [
          { id: 'ch-1', name: 'LED Channel 1', intensity: 75, power: 12.5, temperature: 42 },
          { id: 'ch-2', name: 'LED Channel 2', intensity: 60, power: 10.2, temperature: 38 },
          { id: 'ch-3', name: 'LED Channel 3', intensity: 45, power: 8.1, temperature: 35 }
        ]
      }
    ],
    totalPower: 30.8,
    lastUpdate: new Date().toISOString(),
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500 py-8">
          <Cpu className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading PWM telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">PWM System Overview</h3>
          <div className="text-sm text-gray-600">
            Last updated: {new Date(pwmData.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{pwmData.controllers.length}</div>
            <div className="text-sm text-gray-600">Controllers</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{pwmData.totalPower}W</div>
            <div className="text-sm text-gray-600">Total Power</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {pwmData.controllers.reduce((acc, controller) => acc + controller.channels.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Active Channels</div>
          </div>
        </div>
      </div>

      {/* Controller Status */}
      {pwmData.controllers.map((controller) => (
        <div key={controller.id} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{controller.name}</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              controller.status === 'online' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {controller.status}
            </div>
          </div>
          
          <div className="space-y-4">
            {controller.channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{channel.name}</div>
                  <div className="text-sm text-gray-600">Channel {channel.id}</div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{channel.intensity}%</div>
                    <div className="text-xs text-gray-600">Intensity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{channel.power}W</div>
                    <div className="text-xs text-gray-600">Power</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{channel.temperature}°C</div>
                    <div className="text-xs text-gray-600">Temp</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="text-center text-gray-500 py-8">
          <Gauge className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Performance charts and metrics will be available here</p>
          <p className="text-sm mt-2">Efficiency, power consumption, and thermal analysis</p>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h3>
        {pwmData.alerts.length > 0 ? (
          <div className="space-y-3">
            {pwmData.alerts.map((alert, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm text-yellow-800">{alert}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No active PWM alerts</p>
          </div>
        )}
      </div>

      {/* WIP Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Work in Progress</h4>
            <p className="text-sm text-blue-700 mt-1">
              PWM telemetry features are under development. This page will include real-time monitoring, 
              performance analytics, and advanced control capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 