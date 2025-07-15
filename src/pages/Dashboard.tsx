import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Sun, 
  Activity, 
  Zap,
  Clock,
  Droplets,
  Wrench,
  RefreshCw,
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
import { 
  SystemData, 
  DashboardOperation, 
  DashboardActivity 
} from '../types/dashboard';
import PageHeader from '../components/PageHeader';

// Import dashboard components
import {
  SystemStatus,
  DailyOperations,
  ActivityFeed,
  QuickActions,
  ConnectionStatus
} from '../components/dashboard';

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
  const [systemLoading, setSystemLoading] = useState(true);
  const [systemError, setSystemError] = useState<string | null>(null);
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
        return Activity;
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
          description: 'Main tank temperature dropped to 75.2°F',
          timestamp: '2 minutes ago',
          icon: Thermometer,
          color: 'text-orange-600',
          type: 'warning'
        },
        {
          id: '2',
          title: 'Lighting Schedule',
          description: 'Daylight cycle completed successfully',
          timestamp: '15 minutes ago',
          icon: Sun,
          color: 'text-green-600',
          type: 'success'
        },
        {
          id: '3',
          title: 'System Check',
          description: 'All systems operating normally',
          timestamp: '1 hour ago',
          icon: Activity,
          color: 'text-blue-600',
          type: 'info'
        },
        {
          id: '4',
          title: 'Water Change',
          description: 'Scheduled water change completed',
          timestamp: '2 hours ago',
          icon: RefreshCw,
          color: 'text-green-600',
          type: 'success'
        },
        {
          id: '5',
          title: 'Maintenance Due',
          description: 'Filter maintenance scheduled for tomorrow',
          timestamp: '3 hours ago',
          icon: Wrench,
          color: 'text-orange-600',
          type: 'warning'
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

  // Fetch system status with comprehensive health checks
  const fetchSystemStatus = async () => {
    setSystemLoading(true);
    setSystemError(null);
    
    try {
      // Check multiple services for comprehensive health assessment
      const healthChecks = await Promise.allSettled([
        ApiService.getSystemStatus(), // Core service health
        ApiService.getSystemUsage(), // System metrics
        ApiService.getTemperatureServiceHealth(), // Temperature service
        ApiService.getFlowStatus(), // Flow service
        ApiService.getOutletsStatus(), // Smart outlets service
      ]);

      // Extract results
      const [coreHealth, systemUsage, tempHealth, flowHealth, outletsHealth] = healthChecks;
      
      // Determine overall system status based on all health checks
      let overallStatus = 'healthy';
      let errorCount = 0;
      let degradedCount = 0;
      
      // Check each service health
      const serviceChecks = [tempHealth, flowHealth, outletsHealth];
      serviceChecks.forEach(check => {
        if (check.status === 'rejected') {
          errorCount++;
        } else if (check.value?.data?.status === 'degraded') {
          degradedCount++;
        }
      });

      // Determine overall status
      if (errorCount > 0) {
        overallStatus = 'error';
      } else if (degradedCount > 0) {
        overallStatus = 'degraded';
      }

      // Get system usage data
      let cpuPercent = 0;
      let memoryPercent = 0;
      let diskPercent = 0;
      
      if (systemUsage.status === 'fulfilled' && systemUsage.value?.data) {
        cpuPercent = systemUsage.value.data.cpu_percent || 0;
        memoryPercent = systemUsage.value.data.memory_percent || 0;
        diskPercent = systemUsage.value.data.disk_percent || 0;
      }

      setSystemData({
        temperature: null, // Will be updated by WebSocket
        lighting: null, // Will be updated by WebSocket
        flow: null, // Will be updated by WebSocket
        outlets: null, // Will be updated by WebSocket
        alerts: 0, // Will be updated by WebSocket
        lastUpdate: new Date().toISOString(),
        systemStatus: overallStatus,
        cpuPercent,
        memoryPercent,
        diskPercent,
      });

    } catch (error) {
      console.error('Error fetching system status:', error);
      setSystemError('Failed to fetch system status');
      
      // Set default error state
      setSystemData({
        temperature: null,
        lighting: null,
        flow: null,
        outlets: null,
        alerts: 0,
        lastUpdate: new Date().toISOString(),
        systemStatus: 'error',
        cpuPercent: 0,
        memoryPercent: 0,
        diskPercent: 0,
      });
    } finally {
      setSystemLoading(false);
    }
  };

  // Fetch system status
  useEffect(() => {
    fetchSystemStatus();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDailyOperations();
    loadRecentActivity();
    loadDashboardSummary();
    loadDashboardMetrics();
  }, []);

  // WebSocket connection handling
  useEffect(() => {
    // Check WebSocket connection status periodically
    const checkConnection = () => {
      setIsConnected(wsConnected());
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, [wsConnected]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (isConnected) {
      subscribe('system_status', (data) => {
        setSystemData(prev => ({
          ...prev,
          ...data,
          lastUpdate: new Date().toISOString()
        }));
      });
    }
  }, [isConnected, subscribe]);

  // Log activity function
  const logActivity = async (activity: {
    type: string;
    title: string;
    description: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  }) => {
    try {
      await ApiService.logActivity(activity);
      // Refresh activity feed
      loadRecentActivity();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // Complete operation function
  const completeOperation = async (operationId: string, operationTitle: string) => {
    try {
      await ApiService.completeDailyOperation(operationId);
      
      // Log the activity
      await logActivity({
        type: 'maintenance',
        title: 'Operation Completed',
        description: `Completed: ${operationTitle}`,
        severity: 'success'
      });
      
      // Refresh operations
      loadDailyOperations();
    } catch (err) {
      console.error('Failed to complete operation:', err);
    }
  };

  // Handle operation click
  const handleOperationClick = (operation: DashboardOperation) => {
    if (operation.status === 'due' || operation.status === 'overdue') {
      completeOperation(operation.id, operation.title);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monitor and control your reef aquarium system"
        statusIndicator={{
          status: systemData.systemStatus as 'healthy' | 'error' | 'warning' | 'unknown',
          text: systemData.systemStatus === 'healthy' ? 'All Systems Operational' : 
                systemData.systemStatus === 'degraded' ? 'Some Systems Degraded' : 'System Issues Detected',
          timestamp: systemData.lastUpdate
        }}
        onRefresh={fetchSystemStatus}
        refreshing={systemLoading}
      />
      
      {/* System Status */}
      <SystemStatus 
        systemData={systemData} 
        loading={systemLoading} 
        error={systemError} 
      />

      {/* Daily Operations */}
      <DailyOperations 
        operations={dailyOperations}
        loading={operationsLoading}
        onOperationClick={handleOperationClick}
      />

      {/* Recent Activity Feed */}
      <ActivityFeed 
        activities={recentActivity}
        loading={activityLoading}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
} 