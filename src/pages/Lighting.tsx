import { Sun, Moon, Clock, Settings } from 'lucide-react'

export default function Lighting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lighting Control</h1>
        <p className="mt-2 text-gray-600">
          Manage LED lighting schedules and intensity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Current Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mode</span>
              <span className="text-sm font-medium text-gray-900">Day Mode</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Intensity</span>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Schedule</span>
              <span className="text-sm font-medium text-gray-900">Auto</span>
            </div>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Controls</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-primary">
              <Sun className="h-4 w-4 mr-2" />
              Day Mode
            </button>
            <button className="btn-secondary">
              <Moon className="h-4 w-4 mr-2" />
              Night Mode
            </button>
            <button className="btn-secondary">
              <Clock className="h-4 w-4 mr-2" />
              Custom
            </button>
            <button className="btn-secondary">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lighting Schedule</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Sunrise</p>
              <p className="text-xs text-gray-600">Gradual increase</p>
            </div>
            <span className="text-sm text-gray-900">6:00 AM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Peak</p>
              <p className="text-xs text-gray-600">Maximum intensity</p>
            </div>
            <span className="text-sm text-gray-900">12:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Sunset</p>
              <p className="text-xs text-gray-600">Gradual decrease</p>
            </div>
            <span className="text-sm text-gray-900">6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  )
} 