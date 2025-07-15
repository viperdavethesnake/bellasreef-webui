import { DashboardActivity } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: DashboardActivity[];
  loading: boolean;
}

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
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

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
        </div>
      </div>
      
      <div className="space-y-4 opacity-60">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="relative group cursor-not-allowed"
          >
            <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-200">
                  <activity.icon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-400">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${getActivityTypeColor(activity.type)}`}>
                    {activity.type}
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
          <div className="h-4 w-4 text-blue-600">📊</div>
          <span className="text-sm text-blue-800">
            Activity tracking and logging will be available in a future update
          </span>
        </div>
      </div>
    </div>
  );
} 