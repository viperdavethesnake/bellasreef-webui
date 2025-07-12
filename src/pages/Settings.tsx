import { Settings, Shield, Database, Wifi, Bell, User } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure system preferences and security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Name</span>
              <span className="text-sm font-medium text-gray-900">Bella's Reef Controller</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Firmware Version</span>
              <span className="text-sm font-medium text-gray-900">v2.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">15 days, 3 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Restart</span>
              <span className="text-sm font-medium text-gray-900">2024-01-15 08:30</span>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">WiFi Status</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IP Address</span>
              <span className="text-sm font-medium text-gray-900">192.168.1.100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Signal Strength</span>
              <span className="text-sm font-medium text-gray-900">Excellent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MAC Address</span>
              <span className="text-sm font-medium text-gray-900">00:1B:44:11:3A:B7</span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admin Password</span>
              <button className="text-sm text-reef-600 hover:text-reef-700">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-Factor Auth</span>
              <span className="text-sm font-medium text-gray-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remote Access</span>
              <span className="text-sm font-medium text-gray-900">Disabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm font-medium text-gray-900">2024-01-20 14:22</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Alerts</span>
              <span className="text-sm font-medium text-gray-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMS Alerts</span>
              <span className="text-sm font-medium text-gray-900">Disabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Push Notifications</span>
              <span className="text-sm font-medium text-gray-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alert Level</span>
              <span className="text-sm font-medium text-gray-900">Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Maintenance</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="btn-secondary">
            <Database className="h-4 w-4 mr-2" />
            Backup Settings
          </button>
          <button className="btn-secondary">
            <Shield className="h-4 w-4 mr-2" />
            Restore Settings
          </button>
          <button className="btn-secondary">
            <Settings className="h-4 w-4 mr-2" />
            Factory Reset
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-600">Full access</p>
              </div>
            </div>
            <button className="text-sm text-reef-600 hover:text-reef-700">Edit</button>
          </div>
          <button className="btn-primary">
            <User className="h-4 w-4 mr-2" />
            Add New User
          </button>
        </div>
      </div>
    </div>
  )
} 