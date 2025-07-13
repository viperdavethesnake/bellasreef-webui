import React, { useState, useEffect } from 'react';
import { Settings, Activity, Gauge, Zap } from 'lucide-react';
import { ApiService } from '../services/api';

interface HALChannel {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  value: number;
  min_value: number;
  max_value: number;
  unit: string;
}

interface PWMConfig {
  frequency: number;
  resolution: number;
  channels: Array<{
    id: string;
    name: string;
    duty_cycle: number;
    frequency: number;
    enabled: boolean;
  }>;
}

interface HALController {
  id: string;
  type: string;
  identifier: string;
  name: string;
  status: string;
  properties: {
    channel_count: number;
    resolution: number;
    frequency_range: [number, number];
  };
}

export default function HALPWM() {
  const [halChannels, setHalChannels] = useState<HALChannel[]>([]);
  const [pwmConfig, setPwmConfig] = useState<PWMConfig>({
    frequency: 1000,
    resolution: 8,
    channels: []
  });
  const [controllers, setControllers] = useState<HALController[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHALData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get HAL system status
        const halStatusResponse = await ApiService.getHALStatus();
        console.log('HAL Status:', halStatusResponse.data);

        // Discover available controllers
        const controllersResponse = await ApiService.discoverHALControllers();
        console.log('Discovered Controllers:', controllersResponse.data);
        
        const discoveredControllers = controllersResponse.data.discovered_controllers || [];
        setControllers(discoveredControllers);

        // Get registered controllers
        const registeredControllersResponse = await ApiService.getHALControllers();
        console.log('Registered Controllers:', registeredControllersResponse.data);

        // For now, we'll create mock channels based on discovered controllers
        // In a real implementation, you would register controllers and channels first
        const mockHalChannels: HALChannel[] = discoveredControllers.map((controller: any, index: number) => ({
          id: controller.identifier || `controller_${index}`,
          name: controller.type === 'pca9685' ? `PCA9685 Channel ${index + 1}` : `Native PWM ${index + 1}`,
          type: 'pwm',
          enabled: false, // Controllers are unregistered by default
          value: 0,
          min_value: 0,
          max_value: 100,
          unit: 'percentage'
        }));

        const mockPwmConfig: PWMConfig = {
          frequency: 1000,
          resolution: 8,
          channels: discoveredControllers.map((controller: any, index: number) => ({
            id: controller.identifier || `controller_${index}`,
            name: controller.type === 'pca9685' ? `PCA9685 Channel ${index + 1}` : `Native PWM ${index + 1}`,
            duty_cycle: 0,
            frequency: 1000,
            enabled: false
          }))
        };

        setHalChannels(mockHalChannels);
        setPwmConfig(mockPwmConfig);
      } catch (err: any) {
        setError('Failed to load HAL/PWM data');
        console.error('HAL/PWM fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHALData();
  }, []);

  const handleRegisterController = async (controller: HALController) => {
    try {
      const response = await ApiService.registerHALController({
        type: controller.type,
        identifier: controller.identifier,
        name: controller.name || `${controller.type}_${controller.identifier}`
      });
      console.log('Controller registered:', response.data);
      // Refresh the data
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to register controller:', err);
      setError('Failed to register controller');
    }
  };

  const handleChannelControl = async (channelId: string, intensity: number) => {
    try {
      const response = await ApiService.controlHALChannel(channelId, intensity);
      console.log('Channel controlled:', response.data);
      // Update local state
      setHalChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, value: intensity }
          : channel
      ));
    } catch (err: any) {
      console.error('Failed to control channel:', err);
      setError('Failed to control channel');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HAL PWM Management</h1>
          <p className="mt-2 text-gray-600">
            Control HAL channels and PWM configuration
          </p>
        </div>
        <div className="text-center text-gray-500">Loading HAL/PWM data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HAL PWM Management</h1>
          <p className="mt-2 text-gray-600">
            Control HAL channels and PWM configuration
          </p>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HAL PWM Management</h1>
        <p className="mt-2 text-gray-600">
          Control HAL channels and PWM configuration
        </p>
      </div>

      {/* HAL Controllers */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">HAL Controllers</h3>
        <div className="space-y-4">
          {controllers.map((controller) => (
            <div key={controller.identifier} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{controller.type}</h4>
                    <p className="text-sm text-gray-600">ID: {controller.identifier}</p>
                    <p className="text-sm text-gray-600">
                      Channels: {controller.properties?.channel_count || 'Unknown'} • 
                      Resolution: {controller.properties?.resolution || 'Unknown'} bits
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  controller.status === 'registered'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {controller.status === 'registered' ? 'Registered' : 'Unregistered'}
                </div>
              </div>
              
              {controller.status !== 'registered' && (
                <button 
                  onClick={() => handleRegisterController(controller)}
                  className="btn-primary w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Register Controller
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PWM Configuration */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">PWM Configuration</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Frequency</span>
            <span className="text-sm font-medium text-gray-900">{pwmConfig.frequency} Hz</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Resolution</span>
            <span className="text-sm font-medium text-gray-900">{pwmConfig.resolution} bits</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Active Channels</span>
            <span className="text-sm font-medium text-gray-900">{pwmConfig.channels.filter(c => c.enabled).length}</span>
          </div>
        </div>
      </div>

      {/* HAL Channels */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">HAL Channels</h3>
        <div className="space-y-4">
          {halChannels.map((channel) => (
            <div key={channel.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{channel.type} • {channel.unit}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  channel.enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {channel.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className="text-sm font-medium text-gray-900">{channel.value}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${channel.value}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{channel.min_value}%</span>
                  <span>{channel.max_value}%</span>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleChannelControl(channel.id, Math.min(channel.value + 10, 100))}
                    className="btn-primary flex-1"
                    disabled={!channel.enabled}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Increase
                  </button>
                  <button 
                    onClick={() => handleChannelControl(channel.id, Math.max(channel.value - 10, 0))}
                    className="btn-secondary flex-1"
                    disabled={!channel.enabled}
                  >
                    Decrease
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <button className="btn-primary">
            <Zap className="h-4 w-4 mr-2" />
            Test All
          </button>
          <button className="btn-secondary">
            <Gauge className="h-4 w-4 mr-2" />
            Calibrate
          </button>
          <button className="btn-secondary">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
          <button className="btn-secondary">
            <Activity className="h-4 w-4 mr-2" />
            Monitor
          </button>
        </div>
      </div>
    </div>
  );
}