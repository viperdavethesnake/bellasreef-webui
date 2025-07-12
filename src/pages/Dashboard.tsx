import { 
  Thermometer, 
  Sun, 
  Activity, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard() {
  const systemStatus = {
    temperature: 78.2,
    lighting: 'Day Mode',
    flow: 'Normal',
    outlets: 'All On',
    alerts: 0
  }

  const stats = [
    {
      name: 'Temperature',
      value: `${systemStatus.temperature}°F`,
      icon: Thermometer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Lighting',
      value: systemStatus.lighting,
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Flow',
      value: systemStatus.flow,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Outlets',
      value: systemStatus.outlets,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor and control your reef aquarium system
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {systemStatus.alerts > 0 ? (
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {systemStatus.alerts} Alert{systemStatus.alerts !== 1 ? 's' : ''} Active
              </h3>
              <p className="text-sm text-red-700">
                Check system status for details
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                All Systems Normal
              </h3>
              <p className="text-sm text-green-700">
                Your reef system is operating within optimal parameters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary">
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
    </div>
  )
} 