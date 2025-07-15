import { Clock, Droplets, Wrench, RefreshCw, Activity } from 'lucide-react';
import { DashboardOperation } from '../../types/dashboard';

interface DailyOperationsProps {
  operations: DashboardOperation[];
  loading: boolean;
  onOperationClick: (operation: DashboardOperation) => void;
}

export default function DailyOperations({ operations, loading, onOperationClick }: DailyOperationsProps) {
  const getOperationStatusColor = (status: DashboardOperation['status']) => {
    switch (status) {
      case 'on-time':
        return 'text-green-700';
      case 'due':
        return 'text-orange-700';
      case 'overdue':
        return 'text-red-700';
      case 'completed':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
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

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Operations</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Daily Operations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {operations.map((operation) => (
          <div
            key={operation.id}
            className="relative group cursor-not-allowed opacity-60"
            onClick={() => {}} // Disabled
          >
            <div className="card bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-gray-200">
                    <operation.icon className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {operation.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {operation.nextAction}
                  </p>
                  {operation.lastAction && (
                    <p className="text-xs text-gray-400">
                      {operation.lastAction}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOperationStatusBgColor(operation.status)} ${getOperationStatusColor(operation.status)}`}>
                    {operation.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                Feature Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Daily operations tracking will be available in a future update
          </span>
        </div>
      </div>
    </div>
  );
} 