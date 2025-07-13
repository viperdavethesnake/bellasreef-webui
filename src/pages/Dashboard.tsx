import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Sun, 
  Activity, 
  Zap,
  TrendingUp,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Droplets,
  Wrench,
  RefreshCw,
  Bell,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ApiService } from '../services/api';
import { 
  DailyOperation, 
  ActivityLog, 
  DashboardSummary, 
  DashboardMetrics 
} from '../types/lighting';

interface SystemData {
  temperature: number | null;
  lighting: string | null;
  flow: string | null;
  outlets: string | null;
  alerts: number;
  lastUpdate: string;
  systemStatus: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

interface DashboardOperation {
  id: string;
  title: string;
  icon: any;
  color: string;
  status: 'on-time' | 'due' | 'overdue' | 'completed';
  nextAction: string;
  lastAction?: string;
}

interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export default function Dashboard() {
  const [systemData, setSystemData] = useState<SystemData>({
    temperature: null,
    lighting: null,
    flow: null,
    outlets: null,
    alerts: 0,
    lastUpdate: new Date().toISOString(),
    systemStatus: 'unknown',
    cpuPercent: 0,
    memoryPercent: 0,
    diskPercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { subscribe, isConnected: wsConnected } = useWebSocket();

  // Real data state
  const [dailyOperations, setDailyOperations] = useState<DashboardOperation[]>([]);
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  // Icon mapping for operations
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'feeding':
        return Clock;
      case 'water-testing':
        return Droplets;
      case 'maintenance':
        return Wrench;
      case 'water-change':
        return RefreshCw;
      default:
        return Activity;
    }
  };

  // Icon mapping for activities
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return Thermometer;
      case 'lighting':
        return Sun;
      case 'outlet':
        return Zap;
      case 'system':
        return Activity;
      case 'alert':
        return AlertTriangle;
      case 'maintenance':
        return Wrench;
      default:
        return Info;
    }
  };

  // Color mapping for operations
  const getOperationColor = (type: string) => {
    switch (type) {
      case 'feeding':
        return 'text-green-600';
      case 'water-testing':
        return 'text-blue-600';
      case 'maintenance':
        return 'text-orange-600';
      case 'water-change':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  // Color mapping for activities
  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Load daily operations
  const loadDailyOperations = async () => {
    try {
      setOperationsLoading(true);
      const response = await ApiService.getDailyOperations();
      const operations: DailyOperation[] = response.data;
      
      const dashboardOperations: DashboardOperation[] = operations.map(op => ({
        id: op.id,
        title: op.title,
        icon: getOperationIcon(op.type),
        color: getOperationColor(op.type),
        status: op.status,
        nextAction: `Next: ${new Date(op.nextDue).toLocaleDateString()}`,
        lastAction: op.lastCompleted ? `Last: ${formatRelativeTime(op.lastCompleted)}` : undefined
      }));
      
      setDailyOperations(dashboardOperations);
    } catch (err) {
      console.error('Failed to load daily operations:', err);
      // Fallback to mock data if API fails
      setDailyOperations([
        {
          id: 'feeding',
          title: 'Feeding Schedule',
          icon: Clock,
          color: 'text-green-600',
          status: 'on-time',
          nextAction: 'Next: 2:00 PM',
          lastAction: 'Last: 8:00 AM'
        },
        {
          id: 'water-testing',
          title: 'Water Testing',
          icon: Droplets,
          color: 'text-blue-600',
          status: 'due',
          nextAction: 'Due: Today',
          lastAction: 'Last: 3 days ago'
        },
        {
          id: 'maintenance',
          title: 'Maintenance',
          icon: Wrench,
          color: 'text-orange-600',
          status: 'on-time',
          nextAction: 'Next: Friday',
          lastAction: 'Last: 1 week ago'
        },
        {
          id: 'water-change',
          title: 'Water Changes',
          icon: RefreshCw,
          color: 'text-purple-600',
          status: 'overdue',
          nextAction: 'Overdue: 2 days',
          lastAction: 'Last: 2 weeks ago'
        }
      ]);
    } finally {
      setOperationsLoading(false);
    }
  };

  // Load recent activity
  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await ApiService.getRecentActivity(5);
      const activities: ActivityLog[] = response.data;
      
      const dashboardActivities: DashboardActivity[] = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        timestamp: formatRelativeTime(activity.timestamp),
        icon: getActivityIcon(activity.type),
        color: getActivityColor(activity.severity),
        type: activity.severity
      }));
      
      setRecentActivity(dashboardActivities);
    } catch (err) {
      console.error('Failed to load recent activity:', err);
      // Fallback to mock data if API fails
      setRecentActivity([
        {
          id: '1',
          title: 'Temperature Alert',
          description: 'Main tank temperature rose to 26.5°C',
          timestamp: '2 minutes ago',
          icon: Thermometer,
          color: 'text-orange-600',
          type: 'warning'
        },
        {
          id: '2',
          title: 'System Health Check',
          description: 'All systems operating normally',
          timestamp: '5 minutes ago',
          icon: CheckCircle,
          color: 'text-green-600',
          type: 'success'
        },
        {
          id: '3',
          title: 'Outlet Control',
          description: 'Main pump turned on',
          timestamp: '10 minutes ago',
          icon: Zap,
          color: 'text-blue-600',
          type: 'info'
        },
        {
          id: '4',
          title: 'Lighting Schedule',
          description: 'Day mode activated',
          timestamp: '15 minutes ago',
          icon: Sun,
          color: 'text-yellow-600',
          type: 'info'
        },
        {
          id: '5',
          title: 'System Update',
          description: 'Firmware updated successfully',
          timestamp: '1 hour ago',
          icon: Activity,
          color: 'text-green-600',
          type: 'success'
        }
      ]);
    } finally {
      setActivityLoading(false);
    }
  };

  // Load dashboard summary
  const loadDashboardSummary = async () => {
    try {
      const response = await ApiService.getDashboardSummary();
      setDashboardSummary(response.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  };

  // Load dashboard metrics
  const loadDashboardMetrics = async () => {
    try {
      const response = await ApiService.getDashboardMetrics();
      setDashboardMetrics(response.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  useEffect(() => {
    // Fetch initial system status from API
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get system health
        const healthResponse = await ApiService.getSystemHealth();
        const healthData = healthResponse.data;
        
        // Get system usage
        const usageResponse = await ApiService.getSystemUsage();
        const usageData = usageResponse.data;
        
        // Get system info
        const infoResponse = await ApiService.getSystemInfo();
        const infoData = infoResponse.data;
        
        setSystemData(prev => ({
          ...prev,
          systemStatus: healthData.status || 'unknown',
          cpuPercent: usageData.cpu_percent || 0,
          memoryPercent: usageData.memory_percent || 0,
          diskPercent: usageData.disk_percent || 0,
          lastUpdate: new Date().toISOString(),
        }));
      } catch (err: any) {
        setError('Failed to load system status');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    // Load dashboard data
    loadDailyOperations();
    loadRecentActivity();
    loadDashboardSummary();
    loadDashboardMetrics();
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates
    subscribe('temperature_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        temperature: data.temperature,
        lastUpdate: new Date().toISOString()
      }));
      
      // Log temperature activity
      if (data.temperature) {
        logActivity({
          type: 'temperature',
          title: 'Temperature Update',
          description: `Main tank temperature: ${data.temperature}°C`,
          severity: 'info'
        });
      }
    });

    subscribe('lighting_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        lighting: data.mode,
        lastUpdate: new Date().toISOString()
      }));
      
      // Log lighting activity
      logActivity({
        type: 'lighting',
        title: 'Lighting Update',
        description: `Lighting mode changed to: ${data.mode}`,
        severity: 'info'
      });
    });

    subscribe('outlets_update', (data) => {
      setSystemData(prev => ({
        ...prev,
        outlets: data.status,
        lastUpdate: new Date().toISOString()
      }));
      
      // Log outlet activity
      logActivity({
        type: 'outlet',
        title: 'Outlet Update',
        description: `Outlet status: ${data.status}`,
        severity: 'info'
      });
    });

    subscribe('system_alert', (data) => {
      // Log system alerts
      logActivity({
        type: 'alert',
        title: 'System Alert',
        description: data.message || 'System alert triggered',
        severity: data.severity || 'warning'
      });
    });

    subscribe('connected', () => {
      setIsConnected(true);
      logActivity({
        type: 'system',
        title: 'System Connected',
        description: 'WebSocket connection established',
        severity: 'success'
      });
    });

    subscribe('disconnected', () => {
      setIsConnected(false);
      logActivity({
        type: 'system',
        title: 'System Disconnected',
        description: 'WebSocket connection lost',
        severity: 'error'
      });
    });

    // Check initial connection status
    setIsConnected(wsConnected());
  }, [subscribe, wsConnected]);

  // Log activity function
  const logActivity = async (activity: {
    type: string;
    title: string;
    description: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  }) => {
    try {
      await ApiService.logActivity(activity);
      // Refresh activity feed after logging
      loadRecentActivity();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // Complete daily operation
  const completeOperation = async (operationId: string, operationTitle: string) => {
    try {
      await ApiService.completeDailyOperation(operationId);
      
      // Log the completion
      await logActivity({
        type: 'maintenance',
        title: 'Operation Completed',
        description: `${operationTitle} completed successfully`,
        severity: 'success'
      });
      
      // Refresh operations list
      loadDailyOperations();
    } catch (err) {
      console.error('Failed to complete operation:', err);
      // Log the error
      await logActivity({
        type: 'maintenance',
        title: 'Operation Failed',
        description: `Failed to complete ${operationTitle}`,
        severity: 'error'
      });
    }
  };

  // Handle operation click
  const handleOperationClick = (operation: DashboardOperation) => {
    if (operation.status === 'due' || operation.status === 'overdue') {
      completeOperation(operation.id, operation.title);
    }
    // For completed operations, could show history or details
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50';
      case 'degraded':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getOperationStatusColor = (status: DashboardOperation['status']) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600';
      case 'due':
        return 'text-orange-600';
      case 'overdue':
        return 'text-red-600';
      case 'completed':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getOperationStatusBgColor = (status: DashboardOperation['status']) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100';
      case 'due':
        return 'bg-orange-100';
      case 'overdue':
        return 'bg-red-100';
      case 'completed':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getActivityTypeColor = (type: DashboardActivity['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = [
    {
      name: 'System Status',
      value: systemData.systemStatus.charAt(0).toUpperCase() + systemData.systemStatus.slice(1),
      icon: Activity,
      color: getStatusColor(systemData.systemStatus),
      bgColor: getStatusBgColor(systemData.systemStatus),
      status: systemData.systemStatus === 'healthy' ? 'normal' : 'warning'
    },
    {
      name: 'CPU Usage',
      value: `${systemData.cpuPercent.toFixed(1)}%`,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: systemData.cpuPercent < 80 ? 'normal' : 'warning'
    },
    {
      name: 'Memory Usage',
      value: `${systemData.memoryPercent.toFixed(1)}%`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: systemData.memoryPercent < 80 ? 'normal' : 'warning'
    },
    {
      name: 'Disk Usage',
      value: `${systemData.diskPercent.toFixed(1)}%`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: systemData.diskPercent < 80 ? 'normal' : 'warning'
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
      
      {loading && <div className="text-center text-gray-500">Loading system status...</div>}
      {error && (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
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
                  <p className="text-xs text-yellow-600 mt-1">Check system</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Status */}
      <div className={`card border-l-4 ${
        systemData.systemStatus === 'healthy' 
          ? 'border-l-green-500 bg-green-50' 
          : systemData.systemStatus === 'degraded'
          ? 'border-l-yellow-500 bg-yellow-50'
          : 'border-l-red-500 bg-red-50'
      }`}>
        <div className="flex items-center">
          {systemData.systemStatus === 'healthy' ? (
            <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
          )}
          <div>
            <h3 className={`text-sm font-medium ${
              systemData.systemStatus === 'healthy' 
                ? 'text-green-800' 
                : 'text-yellow-800'
            }`}>
              {systemData.systemStatus === 'healthy' 
                ? 'System Healthy' 
                : systemData.systemStatus === 'degraded'
                ? 'System Degraded'
                : 'System Error'
              }
            </h3>
            <p className={`text-sm ${
              systemData.systemStatus === 'healthy' 
                ? 'text-green-700' 
                : 'text-yellow-700'
            }`}>
              {systemData.systemStatus === 'healthy' 
                ? 'Your reef system is operating within optimal parameters'
                : 'Some system components may need attention'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Daily Operations Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Daily Operations</h3>
          {operationsLoading && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dailyOperations.map((operation) => (
            <button
              key={operation.id}
              onClick={() => handleOperationClick(operation)}
              className={`text-left p-4 rounded-lg border transition-all duration-200 bg-white ${
                operation.status === 'due' || operation.status === 'overdue'
                  ? 'border-orange-200 hover:border-orange-300 hover:shadow-md cursor-pointer'
                  : operation.status === 'completed'
                  ? 'border-green-200 hover:border-green-300 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <operation.icon className={`h-5 w-5 ${operation.color}`} />
                  <span className="font-medium text-gray-900">{operation.title}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getOperationStatusBgColor(operation.status)} ${getOperationStatusColor(operation.status)}`}>
                  {operation.status === 'on-time' && 'On Time'}
                  {operation.status === 'due' && 'Due'}
                  {operation.status === 'overdue' && 'Overdue'}
                  {operation.status === 'completed' && 'Completed'}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>{operation.nextAction}</div>
                {operation.lastAction && (
                  <div className="text-xs text-gray-500 mt-1">{operation.lastAction}</div>
                )}
              </div>
              {(operation.status === 'due' || operation.status === 'overdue') && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Click to complete
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            {activityLoading && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className={`flex-shrink-0 p-1.5 rounded-full ${getActivityTypeColor(activity.type)} bg-opacity-10`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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