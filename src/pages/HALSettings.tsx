import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Save,
  Edit3,
  Zap,
  Cpu,
  Activity
} from 'lucide-react';
import { ApiService } from '../services/api';

interface HALController {
  id: string;
  name: string;
  type: string;
  identifier: string;
  status: 'connected' | 'disconnected' | 'error';
  channels: HALChannel[];
  registered: boolean;
}

interface HALChannel {
  id: string;
  name: string;
  type: 'pwm' | 'digital' | 'analog';
  enabled: boolean;
  value: number;
  min_value: number;
  max_value: number;
  unit: 'percentage' | 'voltage' | 'current';
  duty_cycle?: number;
  frequency?: number;
}

interface HALSettings {
  auto_discovery: boolean;
  default_frequency: number;
  default_resolution: number;
  test_mode: boolean;
}

export default function HALSettings() {
  const [discoveredControllers, setDiscoveredControllers] = useState<HALController[]>([]);
  const [registeredControllers, setRegisteredControllers] = useState<HALController[]>([]);
  const [settings, setSettings] = useState<HALSettings>({
    auto_discovery: true,
    default_frequency: 1000,
    default_resolution: 8,
    test_mode: false
  });
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingController, setEditingController] = useState<HALController | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedController, setSelectedController] = useState<HALController | null>(null);

  useEffect(() => {
    loadRegisteredControllers();
    loadSettings();
  }, []);

  const loadRegisteredControllers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getHALControllers();
      const controllers = response.data.controllers || [];
      setRegisteredControllers(controllers.map((controller: any) => ({
        id: controller.id,
        name: controller.name || `Controller ${controller.id}`,
        type: controller.type,
        identifier: controller.identifier,
        status: controller.status || 'connected',
        channels: controller.channels || [],
        registered: true
      })));
    } catch (err: any) {
      setError('Failed to load registered controllers');
      console.error('Load controllers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Load settings from localStorage for now
      const savedSettings = localStorage.getItem('halSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load HAL settings:', error);
    }
  };

  const discoverControllers = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const response = await ApiService.discoverHALControllers();
      const controllers = response.data.controllers || [];
      setDiscoveredControllers(controllers.map((controller: any) => ({
        id: controller.id,
        name: controller.name || `Unregistered Controller ${controller.id}`,
        type: controller.type,
        identifier: controller.identifier,
        status: controller.status || 'disconnected',
        channels: controller.channels || [],
        registered: false
      })));
    } catch (err: any) {
      setError('Failed to discover controllers');
      console.error('Discovery error:', err);
    } finally {
      setDiscovering(false);
    }
  };

  const registerController = async (controller: HALController, customName?: string) => {
    try {
      const response = await ApiService.registerHALController({
        type: controller.type,
        identifier: controller.identifier,
        name: customName || controller.name
      });
      
      const registeredController: HALController = {
        ...controller,
        name: customName || controller.name,
        registered: true,
        status: 'connected' as const
      };
      
      setRegisteredControllers(prev => [...prev, registeredController]);
      setDiscoveredControllers(prev => prev.filter(c => c.id !== controller.id));
      setShowRegistrationModal(false);
      setEditingController(null);
    } catch (err: any) {
      setError('Failed to register controller');
      console.error('Registration error:', err);
    }
  };

  const unregisterController = async (controllerId: string) => {
    try {
      // In real implementation, this would call the unregistration API
      setRegisteredControllers(prev => prev.filter(c => c.id !== controllerId));
    } catch (err: any) {
      setError('Failed to unregister controller');
      console.error('Unregistration error:', err);
    }
  };

  const updateController = async (controllerId: string, updates: Partial<HALController>) => {
    try {
      setRegisteredControllers(prev => 
        prev.map(c => c.id === controllerId ? { ...c, ...updates } : c)
      );
      setEditingController(null);
    } catch (err: any) {
      setError('Failed to update controller');
      console.error('Update error:', err);
    }
  };

  const loadChannels = async (controllerId: string) => {
    try {
      const response = await ApiService.getHALChannels(controllerId);
      const channels = response.data.channels || [];
      setRegisteredControllers(prev => 
        prev.map(c => c.id === controllerId ? { ...c, channels } : c)
      );
    } catch (err: any) {
      setError('Failed to load channels');
      console.error('Load channels error:', err);
    }
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem('halSettings', JSON.stringify(settings));
      // In real implementation, this would call the settings API
      console.log('Settings saved successfully');
    } catch (err: any) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getControllerTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pwm': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'digital': return <Cpu className="h-4 w-4 text-green-500" />;
      case 'analog': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HAL Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure HAL controllers and PWM channels
          </p>
        </div>
        <div className="text-center text-gray-500">Loading HAL settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HAL Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure HAL controllers and PWM channels
          </p>
        </div>
        <button
          onClick={saveSettings}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {error && (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PWM Configuration */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">PWM Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Frequency (Hz)
              </label>
              <input
                type="number"
                value={settings.default_frequency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  default_frequency: parseInt(e.target.value)
                }))}
                className="input-field"
                min="1"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Resolution (bits)
              </label>
              <input
                type="number"
                value={settings.default_resolution}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  default_resolution: parseInt(e.target.value)
                }))}
                className="input-field"
                min="8"
                max="16"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="test_mode"
                checked={settings.test_mode}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  test_mode: e.target.checked
                }))}
                className="mr-2"
              />
              <label htmlFor="test_mode" className="text-sm font-medium text-gray-700">
                Enable Test Mode
              </label>
            </div>
          </div>
        </div>

        {/* Auto Discovery */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Discovery Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_discovery"
                checked={settings.auto_discovery}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  auto_discovery: e.target.checked
                }))}
                className="mr-2"
              />
              <label htmlFor="auto_discovery" className="text-sm font-medium text-gray-700">
                Auto-discovery enabled
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Automatically discover new HAL controllers on the network
            </p>
          </div>
        </div>
      </div>

      {/* Controller Discovery */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Controller Discovery</h3>
          </div>
          <button
            onClick={discoverControllers}
            disabled={discovering}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
            {discovering ? 'Discovering...' : 'Discover Controllers'}
          </button>
        </div>
        
        {discoveredControllers.length > 0 ? (
          <div className="space-y-3">
            {discoveredControllers.map((controller) => (
              <div key={controller.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(controller.status)}
                  {getControllerTypeIcon(controller.type)}
                  <div>
                    <div className="font-medium text-gray-900">{controller.name}</div>
                    <div className="text-sm text-gray-500">
                      {controller.type} • ID: {controller.identifier}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {controller.channels.length} channels
                  </span>
                  <button
                    onClick={() => {
                      setEditingController(controller);
                      setShowRegistrationModal(true);
                    }}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No unregistered controllers found</p>
            <p className="text-sm">Click "Discover Controllers" to search for new HAL devices</p>
          </div>
        )}
      </div>

      {/* Registered Controllers */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Registered Controllers</h3>
        </div>
        
        {registeredControllers.length > 0 ? (
          <div className="space-y-3">
            {registeredControllers.map((controller) => (
              <div key={controller.id} className="border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(controller.status)}
                    {getControllerTypeIcon(controller.type)}
                    <div>
                      <div className="font-medium text-gray-900">{controller.name}</div>
                      <div className="text-sm text-gray-500">
                        {controller.type} • ID: {controller.identifier}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {controller.channels.length} channels
                    </span>
                    <button
                      onClick={() => {
                        setSelectedController(controller);
                        loadChannels(controller.id);
                      }}
                      className="btn-secondary flex items-center"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Manage
                    </button>
                    <button
                      onClick={() => unregisterController(controller.id)}
                      className="btn-danger flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Channels List */}
                {selectedController?.id === controller.id && controller.channels.length > 0 && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Channels</h4>
                    <div className="space-y-2">
                      {controller.channels.map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {getControllerTypeIcon(channel.type)}
                            <span className="font-medium">{channel.name}</span>
                            <span className="text-gray-500">({channel.type})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              channel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {channel.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <span className="text-gray-600">
                              {channel.value}{channel.unit === 'percentage' ? '%' : channel.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No registered controllers</p>
            <p className="text-sm">Discover and register controllers to start managing HAL devices</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && editingController && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Register Controller</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Controller Name
                </label>
                <input
                  type="text"
                  defaultValue={editingController.name}
                  className="input-field w-full"
                  placeholder="Enter a name for this controller"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setEditingController(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const nameInput = document.querySelector('input[placeholder="Enter a name for this controller"]') as HTMLInputElement;
                    registerController(editingController, nameInput?.value);
                  }}
                  className="btn-primary"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 