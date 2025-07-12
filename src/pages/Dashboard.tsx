import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Sun, 
  Activity, 
  Zap,
  TrendingUp,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface SystemData {
  temperature: number;
  lighting: string;
  flow: string;
  outlets: string;
  alerts: number;
  lastUpdate: string;
}

export default function Dashboard() {
  const [systemData, setSystemData] = useState<SystemData>({
    temperature: 78.2,
    lighting: 'Day Mode',
    flow: 'Normal',
    outlets: 'All On',
    alerts: 0,
    lastUpdate: new Date().toISOString()
  });

  const [isConnected, setIsConnected] = useState(false);
  const { subscribe, isConnected: wsConnected } = useWebSocket();

  useEffect(() => {
    // Subscribe to real-time updates
    subscribe('temperature_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        temperature: data.temperature,
        lastUpdate: new Date().toISOString()
      }));
    });

    subscribe('lighting_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        lighting: data.mode,
        lastUpdate: new Date().toISOString()
      }));
    });

    subscribe('outlets_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        outlets: data.status,
        lastUpdate: new Date().toISOString()
      }));
    });

    subscribe('connected', () => {
      setIsConnected(true);
    });

    subscribe('disconnected', () => {
      setIsConnected(false);
    });

    // Check initial connection status
    setIsConnected(wsConnected());
  }, [subscribe, wsConnected]);

  const stats = [
    {
      name: 'Temperature',
      value: `${systemData.temperature}°F`,
      icon: Thermometer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: systemData.temperature >= 75 && systemData.temperature <= 82 ? 'normal' : 'warning'
    },
    {
      name: 'Lighting',
      value: systemData.lighting,
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      status: 'normal'
    },
    {
      name: 'Flow',
      value: systemData.flow,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'normal'
    },
    {
      name: 'Outlets',
      value: systemData.outlets,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'normal'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor and control your reef aquarium system
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                {stat.status === 'warning' && (
                  <p className="text-xs text-yellow-600 mt-1">Check temperature</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {systemData.alerts > 0 ? (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {systemData.alerts} Alert{systemData.alerts !== 1 ? 's' : ''} Active
              </h3>
              <p className="text-sm text-red-700">
                Check system status for details
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                All Systems Normal
              </h3>
              <p className="text-sm text-green-700">
                Your reef system is operating within optimal parameters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Emergency Stop
          </button>
          <button className="btn-secondary">
            Test All Systems
          </button>
          <button className="btn-secondary">
            Backup Settings
          </button>
          <button className="btn-secondary">
            System Logs
          </button>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(systemData.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
} 