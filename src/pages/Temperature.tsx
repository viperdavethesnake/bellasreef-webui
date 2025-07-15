import { useState, useEffect } from 'react';
import { Thermometer, Snowflake, Flame, AlertTriangle } from 'lucide-react';
import { ApiService } from '../services/api';

interface TemperatureData {
  current: number;
  min: number;
  max: number;
  heater: string;
  chiller: string;
}

export default function Temperature() {
  const [tempData, setTempData] = useState<TemperatureData>({
    current: 78.2,
    min: 75.0,
    max: 82.0,
    heater: 'Off',
    chiller: 'Off'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemperatureData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current temperature
        const currentResponse = await ApiService.getCurrentTemperature();
        const currentData = currentResponse.data;
        
        setTempData({
          current: currentData.temperature || 78.2,
          min: currentData.min_temp || 75.0,
          max: currentData.max_temp || 82.0,
          heater: currentData.heater_status || 'Off',
          chiller: currentData.chiller_status || 'Off'
        });
      } catch (err: any) {
        setError('Failed to load temperature data');
        console.error('Temperature fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Temperature Control</h1>
          <p className="mt-2 text-gray-600">
            Monitor and control heating and cooling systems
          </p>
        </div>
        <div className="text-center text-gray-500">Loading temperature data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Temperature Control</h1>
          <p className="mt-2 text-gray-600">
            Monitor and control heating and cooling systems
          </p>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Temperature Control</h1>
        <p className="mt-2 text-gray-600">
          Monitor and control heating and cooling systems
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Current Temperature */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Temperature</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {tempData.current}°F
            </div>
            <div className="text-sm text-gray-600">
              Range: {tempData.min}°F - {tempData.max}°F
            </div>
          </div>
        </div>

        {/* Temperature Range */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Range</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Minimum</span>
              <span className="text-sm font-medium text-gray-900">{tempData.min}°F</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maximum</span>
              <span className="text-sm font-medium text-gray-900">{tempData.max}°F</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tolerance</span>
              <span className="text-sm font-medium text-gray-900">±0.5°F</span>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Flame className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Heater</span>
              </div>
              <span className={`text-sm font-medium ${tempData.heater === 'On' ? 'text-green-600' : 'text-gray-600'}`}>
                {tempData.heater}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Snowflake className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Chiller</span>
              </div>
              <span className={`text-sm font-medium ${tempData.chiller === 'On' ? 'text-green-600' : 'text-gray-600'}`}>
                {tempData.chiller}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Chart Placeholder */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature History</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Temperature chart will be displayed here</p>
        </div>
      </div>

      {/* Alerts */}
      {tempData.current > tempData.max || tempData.current < tempData.min ? (
        <div className="card border-l-4 border-l-yellow-500">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Temperature Alert
              </h3>
              <p className="text-sm text-yellow-700">
                Temperature is outside safe range. Monitoring closely.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
} 