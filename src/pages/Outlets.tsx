import { Zap, Power, Clock, Settings } from 'lucide-react'

export default function Outlets() {
  const outlets = [
    { id: 1, name: 'Main Pump', status: 'On', power: '45W', schedule: 'Always On' },
    { id: 2, name: 'Return Pump', status: 'On', power: '35W', schedule: 'Always On' },
    { id: 3, name: 'Heater', status: 'On', power: '200W', schedule: 'Auto' },
    { id: 4, name: 'Chiller', status: 'Off', power: '0W', schedule: 'Auto' },
    { id: 5, name: 'LED Lights', status: 'On', power: '120W', schedule: 'Timer' },
    { id: 6, name: 'Skimmer', status: 'On', power: '25W', schedule: 'Always On' },
    { id: 7, name: 'Doser', status: 'Off', power: '0W', schedule: 'Timer' },
    { id: 8, name: 'UV Sterilizer', status: 'On', power: '40W', schedule: 'Timer' }
  ]

  const totalPower = outlets.reduce((sum, outlet) => {
    return sum + (outlet.status === 'On' ? parseInt(outlet.power) : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart Outlets</h1>
        <p className="mt-2 text-gray-600">
          Manage power distribution and equipment control
        </p>
      </div>

      {/* Power Summary */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Power Consumption</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-reef-600 mb-2">
            {totalPower}W
          </div>
          <div className="text-sm text-gray-600">
            Total system power consumption
          </div>
        </div>
      </div>

      {/* Outlet Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {outlets.map((outlet) => (
          <div key={outlet.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{outlet.name}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                outlet.status === 'On' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {outlet.status}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Power</span>
                <span className="text-sm font-medium text-gray-900">{outlet.power}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Schedule</span>
                <span className="text-sm font-medium text-gray-900">{outlet.schedule}</span>
              </div>
              <div className="flex space-x-2">
                <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  outlet.status === 'On'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {outlet.status === 'On' ? 'Turn Off' : 'Turn On'}
                </button>
                <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <button className="btn-primary">
            <Power className="h-4 w-4 mr-2" />
            All On
          </button>
          <button className="btn-secondary">
            <Zap className="h-4 w-4 mr-2" />
            All Off
          </button>
          <button className="btn-secondary">
            <Clock className="h-4 w-4 mr-2" />
            Test Mode
          </button>
          <button className="btn-secondary">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>
    </div>
  )
} 