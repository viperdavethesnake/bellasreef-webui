import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  History,
  MapPin,
  Gauge
} from 'lucide-react';
import { ApiService } from '../services/api';

interface Probe {
  id: string;
  name: string;
  type: 'temperature' | 'ph' | 'salinity' | 'orp' | 'alkalinity' | 'calcium' | 'magnesium';
  current_value: number;
  unit: string;
  min_value: number;
  max_value: number;
  target_value?: number;
  status: 'online' | 'offline' | 'error' | 'calibrating';
  last_reading: string;
  location?: string;
  description?: string;
  calibration_due?: string;
}

interface ProbeTypeConfig {
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const probeTypeConfigs: Record<string, ProbeTypeConfig> = {
  temperature: {
    icon: Thermometer,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Temperature monitoring'
  },
  ph: {
    icon: Gauge,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'pH level monitoring'
  },
  salinity: {
    icon: Gauge,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Salinity monitoring'
  },
  orp: {
    icon: Gauge,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Oxidation reduction potential'
  },
  alkalinity: {
    icon: Gauge,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Alkalinity monitoring'
  },
  calcium: {
    icon: Gauge,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Calcium level monitoring'
  },
  magnesium: {
    icon: Gauge,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    description: 'Magnesium level monitoring'
  }
};

export default function ProbeMonitor() {
  const [probes, setProbes] = useState<Probe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchProbeData();
  }, []);

  const fetchProbeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch temperature probes
      const tempResponse = await ApiService.getCurrentTemperature();
      const tempData = tempResponse.data;
      
      // Mock probe data - in real implementation this would come from backend
      const mockProbes: Probe[] = [
        {
          id: 'temp_001',
          name: 'Main Tank Temperature',
          type: 'temperature',
          current_value: tempData.temperature || 78.5,
          unit: '°F',
          min_value: 75.0,
          max_value: 82.0,
          target_value: 78.0,
          status: 'online',
          last_reading: new Date().toISOString(),
          location: 'Main Display Tank',
          description: 'Primary temperature sensor in main display tank'
        },
        {
          id: 'temp_002',
          name: 'Sump Temperature',
          type: 'temperature',
          current_value: 77.8,
          unit: '°F',
          min_value: 75.0,
          max_value: 82.0,
          target_value: 78.0,
          status: 'online',
          last_reading: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          location: 'Sump Tank',
          description: 'Temperature sensor in sump tank'
        },
        {
          id: 'temp_003',
          name: 'Refugium Temperature',
          type: 'temperature',
          current_value: 79.2,
          unit: '°F',
          min_value: 75.0,
          max_value: 82.0,
          target_value: 78.0,
          status: 'online',
          last_reading: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          location: 'Refugium',
          description: 'Temperature sensor in refugium'
        },
        {
          id: 'ph_001',
          name: 'Main Tank pH',
          type: 'ph',
          current_value: 8.2,
          unit: 'pH',
          min_value: 7.8,
          max_value: 8.4,
          target_value: 8.1,
          status: 'online',
          last_reading: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          location: 'Main Display Tank',
          description: 'pH probe in main display tank',
          calibration_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sal_001',
          name: 'Salinity',
          type: 'salinity',
          current_value: 1.025,
          unit: 'SG',
          min_value: 1.020,
          max_value: 1.030,
          target_value: 1.025,
          status: 'online',
          last_reading: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          location: 'Main Display Tank',
          description: 'Salinity sensor in main tank'
        },
        {
          id: 'orp_001',
          name: 'ORP',
          type: 'orp',
          current_value: 350,
          unit: 'mV',
          min_value: 300,
          max_value: 450,
          target_value: 375,
          status: 'online',
          last_reading: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          location: 'Main Display Tank',
          description: 'Oxidation reduction potential sensor'
        },
        {
          id: 'alk_001',
          name: 'Alkalinity',
          type: 'alkalinity',
          current_value: 8.5,
          unit: 'dKH',
          min_value: 7.0,
          max_value: 11.0,
          target_value: 8.5,
          status: 'calibrating',
          last_reading: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          location: 'Main Display Tank',
          description: 'Alkalinity monitoring sensor'
        }
      ];
      
      setProbes(mockProbes);
    } catch (err: any) {
      setError('Failed to load probe data');
      console.error('Probe fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchProbeData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-gray-600';
      case 'error': return 'text-red-600';
      case 'calibrating': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'calibrating': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getValueStatus = (probe: Probe) => {
    if (probe.current_value > probe.max_value) return 'high';
    if (probe.current_value < probe.min_value) return 'low';
    return 'normal';
  };

  const getValueColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-900';
    }
  };

  const getValueIcon = (status: string) => {
    switch (status) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredProbes = probes.filter(probe => {
    const typeMatch = filterType === 'all' || probe.type === filterType;
    const statusMatch = filterStatus === 'all' || probe.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const probeTypes = Array.from(new Set(probes.map(p => p.type)));
  const probeStatuses = Array.from(new Set(probes.map(p => p.status)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Probe Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of all registered probes and sensors
          </p>
        </div>
        <div className="text-center text-gray-500">Loading probe data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Probe Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of all registered probes and sensors
          </p>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Probe Monitoring</h1>
        <p className="mt-2 text-gray-600">
          Real-time monitoring of all registered probes and sensors
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Thermometer className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Probes</p>
              <p className="text-2xl font-bold text-gray-900">{probes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Online</p>
              <p className="text-2xl font-bold text-green-600">
                {probes.filter(p => p.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {probes.filter(p => getValueStatus(p) !== 'normal').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Offline</p>
              <p className="text-2xl font-bold text-yellow-600">
                {probes.filter(p => p.status === 'offline').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              {probeTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              {probeStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              <History className="h-4 w-4 mr-2" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Probes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProbes.map((probe) => {
          const valueStatus = getValueStatus(probe);
          const config = probeTypeConfigs[probe.type];
          const IconComponent = config?.icon || Thermometer;
          
          return (
            <div key={probe.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-gray-50'}`}>
                    <IconComponent className={`h-5 w-5 ${config?.color || 'text-gray-600'}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{probe.name}</h3>
                    <p className="text-sm text-gray-500">{probe.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(probe.status)}
                  <span className={`ml-1 text-xs font-medium ${getStatusColor(probe.status)}`}>
                    {probe.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Location */}
                {probe.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {probe.location}
                  </div>
                )}
                
                {/* Current Value */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current</span>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${getValueColor(valueStatus)}`}>
                      {probe.current_value}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{probe.unit}</span>
                    {getValueIcon(valueStatus)}
                  </div>
                </div>
                
                {/* Target Value */}
                {probe.target_value && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="text-sm font-medium text-gray-900">
                      {probe.target_value} {probe.unit}
                    </span>
                  </div>
                )}
                
                {/* Range */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Range</span>
                  <span className="text-sm text-gray-900">
                    {probe.min_value} - {probe.max_value} {probe.unit}
                  </span>
                </div>
                
                {/* Last Reading */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Reading</span>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(probe.last_reading)}
                  </span>
                </div>
                
                {/* Calibration Due */}
                {probe.calibration_due && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Calibration Due</span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(probe.calibration_due)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Alert if out of range */}
              {valueStatus !== 'normal' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      Value is {valueStatus} (outside normal range)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Description */}
              {probe.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{probe.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No results */}
      {filteredProbes.length === 0 && (
        <div className="text-center py-12">
          <Thermometer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No probes found</h3>
          <p className="text-gray-500">Try adjusting your filters or check if probes are properly registered.</p>
        </div>
      )}
    </div>
  );
} 