import { useState, useEffect } from 'react';
import { Thermometer, Activity, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface TemperatureData {
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  alerts: string[];
}

export default function TelemetryTemperature() {
  const [tempData, setTempData] = useState<TemperatureData>({
    current: 78.5,
    unit: '°F',
    trend: 'stable',
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-blue-500 transform rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'Rising';
      case 'down':
        return 'Falling';
      default:
        return 'Stable';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500 py-8">
          <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading temperature telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Temperature */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current Temperature</h3>
          <div className="flex items-center space-x-2">
            {getTrendIcon(tempData.trend)}
            <span className="text-sm text-gray-600">{getTrendText(tempData.trend)}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-reef-600 mb-2">
            {tempData.current}{tempData.unit}
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date(tempData.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Temperature Trends */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Trends</h3>
        <div className="text-center text-gray-500 py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Temperature trend charts will be available here</p>
          <p className="text-sm mt-2">Historical data, graphs, and analysis</p>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h3>
        {tempData.alerts.length > 0 ? (
          <div className="space-y-3">
            {tempData.alerts.map((alert, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm text-yellow-800">{alert}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No active temperature alerts</p>
          </div>
        )}
      </div>

      {/* Data Collection Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Collection Status</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Continuous Monitoring</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">1min</div>
            <div className="text-sm text-gray-600">Update Interval</div>
          </div>
        </div>
      </div>

      {/* WIP Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Work in Progress</h4>
            <p className="text-sm text-blue-700 mt-1">
              Temperature telemetry features are under development. This page will include real-time data, 
              historical trends, and advanced monitoring capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 