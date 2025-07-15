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
import { 
  PageHeader, 
  Card, 
  MetricCard, 
  Button, 
  Badge,
  DataLoadingWrapper,
  EmptyState
} from '../components';

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
  role?: string;
  poll_enabled?: boolean;
  poll_interval?: number;
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
      // Fetch real temperature probes from the API
      const tempResponse = await ApiService.getCurrentTemperature();
      const tempData = tempResponse.data;
      
      // Handle different possible response structures
      let probes = [];
      if (Array.isArray(tempData)) {
        probes = tempData;
      } else if (tempData && Array.isArray(tempData.probes)) {
        probes = tempData.probes;
      } else if (tempData && Array.isArray(tempData.devices)) {
        probes = tempData.devices;
      } else {
        console.warn('Unexpected registered probes response structure:', tempData);
        probes = [];
      }
      
      // Map real probes to our interface and fetch current readings
      const realProbes = await Promise.all(probes.map(async (probe: any) => {
        const deviceId = probe.id || probe.device_id;
        let current_value = 0;
        let last_reading = probe.last_reading || probe.updated_at || new Date().toISOString();
        
        try {
          // Fetch current temperature reading for this registered probe
          if (deviceId && typeof deviceId === 'number') {
            const readingResponse = await ApiService.getRegisteredProbeReading(deviceId, 'F');
            const readingData = readingResponse.data;
            current_value = readingData.temperature || readingData.temp || 0;
            last_reading = readingData.timestamp || readingData.last_reading || last_reading;
          } else {
            // Fallback: try hardware reading endpoint
            const hardwareId = probe.address || probe.hardware_id;
            if (hardwareId) {
              const hardwareResponse = await ApiService.getProbeReading(hardwareId, 'F');
              const hardwareData = hardwareResponse.data;
              current_value = hardwareData.temperature || hardwareData.temp || 0;
              last_reading = hardwareData.timestamp || hardwareData.last_reading || last_reading;
            }
          }
        } catch (readingErr) {
          console.warn(`Failed to get reading for probe ${deviceId}:`, readingErr);
        }
        
        return {
          id: probe.address || probe.id || probe.hardware_id,
          name: probe.name || `Probe ${probe.address || probe.id}`,
          type: 'temperature' as const,
          current_value: current_value,
          unit: probe.unit || '°F',
          min_value: probe.min_value || 68,
          max_value: probe.max_value || 86,
          target_value: probe.target_value || 78,
          status: probe.is_active ? 'online' : 'offline',
          last_reading: last_reading,
          description: probe.description || `Temperature probe ${probe.name}`,
          role: probe.role,
          poll_enabled: probe.poll_enabled,
          poll_interval: probe.poll_interval
        };
      }));
      
      setProbes(realProbes);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Probe Monitoring"
        description="Real-time monitoring of all registered probes and sensors. Currently showing temperature probes."
        onRefresh={refreshData}
        refreshing={refreshing}
      />

      <DataLoadingWrapper
        isLoading={loading}
        error={error}
        isEmpty={!loading && !error && probes.length === 0}
        emptyTitle="No probes found"
        emptyDescription="No temperature probes are currently registered. Register probes in the Temperature Settings to start monitoring."
        emptyIcon={<Thermometer className="h-12 w-12" />}
        emptyAction={
          <Button variant="primary" onClick={() => window.location.href = '/settings/temperature'}>
            Go to Temperature Settings
          </Button>
        }
        loadingText="Loading probe data..."
        errorTitle="Failed to load probes"
        errorMessage="Unable to load probe data. Please check your connection and try again."
        errorAction={
          <Button variant="primary" onClick={fetchProbeData}>
            Try Again
          </Button>
        }
      >
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Probes"
            value={probes.length}
            icon={Thermometer}
          />
          
          <MetricCard
            title="Online"
            value={probes.filter(p => p.status === 'online').length}
            icon={CheckCircle}
            trend="up"
          />
          
          <MetricCard
            title="Alerts"
            value={probes.filter(p => getValueStatus(p) !== 'normal').length}
            icon={AlertTriangle}
            trend="down"
          />
          
          <MetricCard
            title="Offline"
            value={probes.filter(p => p.status === 'offline').length}
            icon={Clock}
            trend="neutral"
          />
        </div>

        {/* Filters and Actions */}
        <Card>
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
              <Button
                onClick={refreshData}
                disabled={refreshing}
                icon={RefreshCw}
                loading={refreshing}
              >
                Refresh
              </Button>
              <Button 
                disabled
                variant="secondary"
                icon={History}
                title="History feature coming soon"
              >
                History
              </Button>
            </div>
          </div>
        </Card>

        {/* Probes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProbes.map((probe) => {
            const valueStatus = getValueStatus(probe);
            const config = probeTypeConfigs[probe.type];
            const IconComponent = config?.icon || Thermometer;
            
            return (
              <Card key={probe.id} hover>
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
                  <Badge variant={probe.status === 'online' ? 'success' : probe.status === 'error' ? 'error' : 'default'}>
                    {probe.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {/* Role */}
                  {probe.role && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {probe.role}
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
                  
                  {/* Polling Status */}
                  {probe.poll_enabled !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Polling</span>
                      <span className="text-sm text-gray-900">
                        {probe.poll_enabled ? 'Enabled' : 'Disabled'}
                        {probe.poll_enabled && probe.poll_interval && ` (${probe.poll_interval}s)`}
                      </span>
                    </div>
                  )}
                  
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
              </Card>
            );
          })}
        </div>

        {/* No results */}
        {filteredProbes.length === 0 && probes.length > 0 && (
          <EmptyState
            title="No probes match your filters"
            description="Try adjusting your filter criteria to see more results."
            icon={<Thermometer className="h-12 w-12" />}
          />
        )}
      </DataLoadingWrapper>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Probe Monitoring"
        description="Real-time monitoring of all registered probes and sensors. Currently showing temperature probes."
        onRefresh={refreshData}
        refreshing={refreshing}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Probes"
          value={probes.length}
          icon={Thermometer}
        />
        
        <MetricCard
          title="Online"
          value={probes.filter(p => p.status === 'online').length}
          icon={CheckCircle}
          trend="up"
        />
        
        <MetricCard
          title="Alerts"
          value={probes.filter(p => getValueStatus(p) !== 'normal').length}
          icon={AlertTriangle}
          trend="down"
        />
        
        <MetricCard
          title="Offline"
          value={probes.filter(p => p.status === 'offline').length}
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Filters and Actions */}
      <Card>
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
            <Button
              onClick={refreshData}
              disabled={refreshing}
              icon={RefreshCw}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button 
              disabled
              variant="secondary"
              icon={History}
              title="History feature coming soon"
            >
              History
            </Button>
          </div>
        </div>
      </Card>

      {/* Probes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProbes.map((probe) => {
          const valueStatus = getValueStatus(probe);
          const config = probeTypeConfigs[probe.type];
          const IconComponent = config?.icon || Thermometer;
          
          return (
            <Card key={probe.id} hover>
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
                <Badge variant={probe.status === 'online' ? 'success' : probe.status === 'error' ? 'error' : 'default'}>
                  {probe.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* Role */}
                {probe.role && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {probe.role}
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
                
                {/* Polling Status */}
                {probe.poll_enabled !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Polling</span>
                    <span className="text-sm text-gray-900">
                      {probe.poll_enabled ? 'Enabled' : 'Disabled'}
                      {probe.poll_enabled && probe.poll_interval && ` (${probe.poll_interval}s)`}
                    </span>
                  </div>
                )}
                
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
            </Card>
          );
        })}
      </div>

      {/* No results */}
      {filteredProbes.length === 0 && probes.length > 0 && (
        <EmptyState
          title="No probes match your filters"
          description="Try adjusting your filter criteria to see more results."
          icon={<Thermometer className="h-12 w-12" />}
        />
      )}
    </div>
  );
} 