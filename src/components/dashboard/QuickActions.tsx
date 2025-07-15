export default function QuickActions() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative group cursor-not-allowed opacity-60">
          <div className="card bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-200">
                  <div className="h-6 w-6 text-gray-500">🛑</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Emergency Stop</p>
                <p className="text-xs text-gray-500">System shutdown</p>
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

        <div className="relative group cursor-not-allowed opacity-60">
          <div className="card bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-200">
                  <div className="h-6 w-6 text-gray-500">🧪</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Test All Systems</p>
                <p className="text-xs text-gray-500">Run diagnostics</p>
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

        <div className="relative group cursor-not-allowed opacity-60">
          <div className="card bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-200">
                  <div className="h-6 w-6 text-gray-500">💾</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Backup Settings</p>
                <p className="text-xs text-gray-500">Export configuration</p>
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

        <div className="relative group cursor-not-allowed opacity-60">
          <div className="card bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-200">
                  <div className="h-6 w-6 text-gray-500">📋</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">System Logs</p>
                <p className="text-xs text-gray-500">View diagnostics</p>
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
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 text-blue-600">⚡</div>
          <span className="text-sm text-blue-800">
            Quick actions and system controls will be available in a future update
          </span>
        </div>
      </div>
    </div>
  );
} 