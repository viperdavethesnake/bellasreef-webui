import { Activity, Gauge, Settings, Play, Pause } from 'lucide-react'

export default function Flow() {
  const flowData = {
    mainPump: { status: 'On', speed: 75, flow: '1200 LPH' },
    returnPump: { status: 'On', speed: 60, flow: '800 LPH' },
    powerheads: { status: 'On', speed: 80, flow: '2000 LPH' },
    totalFlow: '4000 LPH'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flow Control</h1>
        <p className="mt-2 text-gray-600">
          Manage circulation pumps and flow rates
        </p>
      </div>

      {/* Total Flow */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Total System Flow</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-reef-600 mb-2">
            {flowData.totalFlow}
          </div>
          <div className="text-sm text-gray-600">
            Combined flow rate from all pumps
          </div>
        </div>
      </div>

      {/* Pump Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Pump */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Main Pump</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              flowData.mainPump.status === 'On' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {flowData.mainPump.status}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <span className="text-sm font-medium text-gray-900">{flowData.mainPump.speed}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flow Rate</span>
              <span className="text-sm font-medium text-gray-900">{flowData.mainPump.flow}</span>
            </div>
            <div className="flex space-x-2">
              <button className="btn-primary flex-1">
                <Play className="h-4 w-4 mr-1" />
                Start
              </button>
              <button className="btn-secondary flex-1">
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* Return Pump */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Return Pump</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              flowData.returnPump.status === 'On' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {flowData.returnPump.status}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <span className="text-sm font-medium text-gray-900">{flowData.returnPump.speed}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flow Rate</span>
              <span className="text-sm font-medium text-gray-900">{flowData.returnPump.flow}</span>
            </div>
            <div className="flex space-x-2">
              <button className="btn-primary flex-1">
                <Play className="h-4 w-4 mr-1" />
                Start
              </button>
              <button className="btn-secondary flex-1">
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* Powerheads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Powerheads</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              flowData.powerheads.status === 'On' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {flowData.powerheads.status}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <span className="text-sm font-medium text-gray-900">{flowData.powerheads.speed}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flow Rate</span>
              <span className="text-sm font-medium text-gray-900">{flowData.powerheads.flow}</span>
            </div>
            <div className="flex space-x-2">
              <button className="btn-primary flex-1">
                <Play className="h-4 w-4 mr-1" />
                Start
              </button>
              <button className="btn-secondary flex-1">
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Patterns */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Flow Patterns</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="btn-primary">
            <Activity className="h-4 w-4 mr-2" />
            Reef Mode
          </button>
          <button className="btn-secondary">
            <Gauge className="h-4 w-4 mr-2" />
            SPS Mode
          </button>
          <button className="btn-secondary">
            <Settings className="h-4 w-4 mr-2" />
            Custom
          </button>
        </div>
      </div>
    </div>
  )
} 