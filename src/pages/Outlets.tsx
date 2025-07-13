import { useState, useEffect } from 'react';
import { Zap, Power, Clock, Settings } from 'lucide-react';
import { ApiService } from '../services/api';

interface Outlet {
  id: number;
  name: string;
  status: string;
  power: string;
  schedule: string;
}

export default function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [totalPower, setTotalPower] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutletsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch outlets status
        const outletsResponse = await ApiService.getOutletsStatus();
        const outletsData = outletsResponse.data;
        
        // Transform API data to match UI structure
        // Since the API returns an empty array initially, we'll show a message
        const transformedOutlets = outletsData.outlets?.map((outlet: any, index: number) => ({
          id: outlet.id || index + 1,
          name: outlet.name || `Outlet ${index + 1}`,
          status: outlet.status || 'Off',
          power: outlet.power ? `${outlet.power}W` : '0W',
          schedule: outlet.schedule || 'Always On'
        })) || [];
        
        setOutlets(transformedOutlets);
        setTotalPower(outletsData.total_power || 0);
      } catch (err: any) {
        setError('Failed to load outlets data');
        console.error('Outlets fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletsData();
  }, []);

  const handleOutletToggle = async (outletId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'On' ? false : true;
      await ApiService.setOutletControl(outletId, newStatus);
      
      // Update local state
      setOutlets(prev => prev.map(outlet => 
        outlet.id === outletId 
          ? { ...outlet, status: newStatus ? 'On' : 'Off' }
          : outlet
      ));
    } catch (err: any) {
      console.error('Failed to toggle outlet:', err);
      setError('Failed to toggle outlet');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Outlets</h1>
          <p className="mt-2 text-gray-600">
            Manage power distribution and equipment control
          </p>
        </div>
        <div className="text-center text-gray-500">Loading outlets data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Outlets</h1>
          <p className="mt-2 text-gray-600">
            Manage power distribution and equipment control
          </p>
        </div>
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Outlets</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Power Summary</h3>
            <p className="text-sm text-gray-600">Total power consumption</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalPower}W</div>
            <div className="text-sm text-gray-600">Total Consumption</div>
          </div>
        </div>
      </div>

      {/* Outlets List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Outlets</h3>
        
        {outlets.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Outlets Found</h3>
            <p className="text-gray-600 mb-4">
              No smart outlets are currently configured. You can discover and add outlets to control your equipment.
            </p>
            <button className="btn-primary">
              <Settings className="h-4 w-4 mr-2" />
              Discover Outlets
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {outlets.map((outlet) => (
              <div key={outlet.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      outlet.status === 'On' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Power className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                      <p className="text-sm text-gray-600">{outlet.power}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      outlet.status === 'On' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {outlet.status}
                    </span>
                    <button
                      onClick={() => handleOutletToggle(outlet.id, outlet.status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        outlet.status === 'On'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {outlet.status === 'On' ? 'Turn Off' : 'Turn On'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{outlet.schedule}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="btn-primary">
            <Zap className="h-4 w-4 mr-2" />
            All On
          </button>
          <button className="btn-secondary">
            <Power className="h-4 w-4 mr-2" />
            All Off
          </button>
          <button className="btn-secondary">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>
    </div>
  );
} 