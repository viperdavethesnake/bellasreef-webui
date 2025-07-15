import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export interface StatusIndicator {
  status: 'healthy' | 'error' | 'warning' | 'unknown' | 'loading';
  text?: string;
  details?: string;
  timestamp?: string;
  version?: string;
}

export interface PageHeaderProps {
  title: string;
  description: string;
  statusIndicator?: StatusIndicator;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function PageHeader({
  title,
  description,
  statusIndicator,
  actions,
  onRefresh,
  refreshing = false
}: PageHeaderProps) {
  const getStatusIcon = (status: StatusIndicator['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-gray-400 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: StatusIndicator['status'], text?: string) => {
    if (text) return text;
    
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: StatusIndicator['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'loading':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          {statusIndicator && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusIndicator.status)}`}>
              {getStatusIcon(statusIndicator.status)}
              <span>{getStatusText(statusIndicator.status, statusIndicator.text)}</span>
              {statusIndicator.version && (
                <span className="text-xs opacity-75">v{statusIndicator.version}</span>
              )}
            </div>
          )}
          
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
          
          {/* Custom Actions */}
          {actions}
        </div>
      </div>
      
      {/* Status Details */}
      {statusIndicator && (statusIndicator.details || statusIndicator.timestamp) && (
        <div className="mt-3 text-xs text-gray-500 flex items-center space-x-4">
          {statusIndicator.details && (
            <span>{statusIndicator.details}</span>
          )}
          {statusIndicator.timestamp && (
            <span>Last check: {new Date(statusIndicator.timestamp).toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  );
} 