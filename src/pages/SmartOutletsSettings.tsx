import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Save,
  Edit3,
  Cloud,
  Wifi,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { ApiService } from '../services/api';

interface SmartOutlet {
  id: string;
  name: string;
  type: 'vesync' | 'kasa' | 'shelly';
  status: 'online' | 'offline' | 'error';
  power: 'on' | 'off';
  voltage?: number;
  current?: number;
  power_consumption?: number;
  last_reading: string;
  registered: boolean;
}

interface VeSyncAccount {
  email: string;
  password: string;
  verified: boolean;
  outlets: SmartOutlet[];
}

interface LocalNetwork {
  network: string;
  devices: SmartOutlet[];
}

interface SmartOutletsSettings {
  vesync_account: VeSyncAccount | null;
  local_networks: LocalNetwork[];
  auto_discovery: boolean;
  power_monitoring: boolean;
}

export default function SmartOutletsSettings() {
  const [vesyncAccount, setVeSyncAccount] = useState<VeSyncAccount | null>(null);
  const [localNetworks, setLocalNetworks] = useState<LocalNetwork[]>([]);
  const [discoveredOutlets, setDiscoveredOutlets] = useState<SmartOutlet[]>([]);
  const [registeredOutlets, setRegisteredOutlets] = useState<SmartOutlet[]>([]);
  const [settings, setSettings] = useState<SmartOutletsSettings>({
    vesync_account: null,
    local_networks: [],
    auto_discovery: true,
    power_monitoring: true
  });
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVeSyncModal, setShowVeSyncModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<SmartOutlet | null>(null);

  useEffect(() => {
    loadRegisteredOutlets();
    loadSettings();
  }, []);

  const loadRegisteredOutlets = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getOutletsStatus();
      const outlets = response.data.outlets || [];
      setRegisteredOutlets(outlets.map((outlet: any) => ({
        id: outlet.id,
        name: outlet.name || `Outlet ${outlet.id}`,
        type: outlet.type || 'kasa',
        status: outlet.status || 'online',
        power: outlet.power || 'off',
        voltage: outlet.voltage,
        current: outlet.current,
        power_consumption: outlet.power_consumption,
        last_reading: outlet.last_reading,
        registered: true
      })));
    } catch (err: any) {
      setError('Failed to load registered outlets');
      console.error('Load outlets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Load settings from localStorage for now
      const savedSettings = localStorage.getItem('smartOutletsSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setVeSyncAccount(parsed.vesync_account);
        setLocalNetworks(parsed.local_networks || []);
      }
    } catch (error) {
      console.error('Failed to load smart outlets settings:', error);
    }
  };

  const discoverOutlets = async () => {
    setDiscovering(true);
    setError(null);
    try {
      // Simulate outlet discovery - in real implementation this would call the discovery API
      const mockDiscoveredOutlets: SmartOutlet[] = [
        {
          id: 'outlet_001',
          name: 'Unregistered Outlet 1',
          type: 'kasa',
          status: 'online',
          power: 'off',
          voltage: 120.5,
          current: 0.0,
          power_consumption: 0.0,
          last_reading: new Date().toISOString(),
          registered: false
        },
        {
          id: 'outlet_002',
          name: 'Unregistered Outlet 2',
          type: 'shelly',
          status: 'online',
          power: 'on',
          voltage: 120.3,
          current: 2.1,
          power_consumption: 252.63,
          last_reading: new Date().toISOString(),
          registered: false
        }
      ];
      setDiscoveredOutlets(mockDiscoveredOutlets);
    } catch (err: any) {
      setError('Failed to discover outlets');
      console.error('Discovery error:', err);
    } finally {
      setDiscovering(false);
    }
  };

  const testVeSyncCredentials = async (email: string, password: string) => {
    setTesting(true);
    setError(null);
    try {
      // In real implementation, this would call the VeSync API to verify credentials
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const testAccount: VeSyncAccount = {
        email,
        password,
        verified: true,
        outlets: []
      };
      
      setVeSyncAccount(testAccount);
      setSettings(prev => ({ ...prev, vesync_account: testAccount }));
      setShowVeSyncModal(false);
      
      // Discover VeSync outlets
      const mockVeSyncOutlets: SmartOutlet[] = [
        {
          id: 'vesync_001',
          name: 'VeSync Outlet 1',
          type: 'vesync',
          status: 'online',
          power: 'off',
          voltage: 120.0,
          current: 0.0,
          power_consumption: 0.0,
          last_reading: new Date().toISOString(),
          registered: false
        }
      ];
      setDiscoveredOutlets(prev => [...prev, ...mockVeSyncOutlets]);
    } catch (err: any) {
      setError('Failed to verify VeSync credentials');
      console.error('VeSync test error:', err);
    } finally {
      setTesting(false);
    }
  };

  const registerOutlet = async (outlet: SmartOutlet, customName?: string) => {
    try {
      // In real implementation, this would call the registration API
      const registeredOutlet = {
        ...outlet,
        name: customName || outlet.name,
        registered: true
      };
      
      setRegisteredOutlets(prev => [...prev, registeredOutlet]);
      setDiscoveredOutlets(prev => prev.filter(o => o.id !== outlet.id));
    } catch (err: any) {
      setError('Failed to register outlet');
      console.error('Registration error:', err);
    }
  };

  const unregisterOutlet = async (outletId: string) => {
    try {
      // In real implementation, this would call the unregistration API
      setRegisteredOutlets(prev => prev.filter(o => o.id !== outletId));
    } catch (err: any) {
      setError('Failed to unregister outlet');
      console.error('Unregistration error:', err);
    }
  };

  const saveSettings = async () => {
    try {
      const updatedSettings = {
        ...settings,
        vesync_account: vesyncAccount,
        local_networks: localNetworks
      };
      localStorage.setItem('smartOutletsSettings', JSON.stringify(updatedSettings));
      // In real implementation, this would call the settings API
      console.log('Settings saved successfully');
    } catch (err: any) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOutletTypeIcon = (type: string) => {
    switch (type) {
      case 'vesync': return <Cloud className="h-4 w-4 text-blue-500" />;
      case 'kasa': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'shelly': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOutletTypeLabel = (type: string) => {
    switch (type) {
      case 'vesync': return 'VeSync (Cloud)';
      case 'kasa': return 'Kasa (Local)';
      case 'shelly': return 'Shelly (Local)';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Outlets Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure cloud and local smart outlets
          </p>
        </div>
        <div className="text-center text-gray-500">Loading smart outlets settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Outlets Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure cloud and local smart outlets
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
        {/* VeSync Account */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cloud className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">VeSync Account</h3>
            </div>
            {vesyncAccount?.verified && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Connected
              </span>
            )}
          </div>
          
          {vesyncAccount ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">{vesyncAccount.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium ${
                  vesyncAccount.verified ? 'text-green-600' : 'text-red-600'
                }`}>
                  {vesyncAccount.verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Outlets Found</span>
                <span className="text-sm font-medium text-gray-900">{vesyncAccount.outlets.length}</span>
              </div>
              <button
                onClick={() => setShowVeSyncModal(true)}
                className="btn-secondary w-full"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Update Credentials
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">No VeSync account configured</p>
              <button
                onClick={() => setShowVeSyncModal(true)}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add VeSync Account
              </button>
            </div>
          )}
        </div>

        {/* Local Network Discovery */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Local Network</h3>
            </div>
            <button
              onClick={discoverOutlets}
              disabled={discovering}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
              {discovering ? 'Scanning...' : 'Scan Network'}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kasa Devices</span>
              <span className="text-sm font-medium text-gray-900">
                {discoveredOutlets.filter(o => o.type === 'kasa').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shelly Devices</span>
              <span className="text-sm font-medium text-gray-900">
                {discoveredOutlets.filter(o => o.type === 'shelly').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Found</span>
              <span className="text-sm font-medium text-gray-900">
                {discoveredOutlets.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-500 mr-2" />
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="power_monitoring"
              checked={settings.power_monitoring}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                power_monitoring: e.target.checked
              }))}
              className="mr-2"
            />
            <label htmlFor="power_monitoring" className="text-sm font-medium text-gray-700">
              Power consumption monitoring
            </label>
          </div>
        </div>
      </div>

      {/* Discovered Outlets */}
      {discoveredOutlets.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Discovered Outlets</h3>
          </div>
          
          <div className="space-y-3">
            {discoveredOutlets.map((outlet) => (
              <div key={outlet.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(outlet.status)}
                  {getOutletTypeIcon(outlet.type)}
                  <div>
                    <div className="font-medium text-gray-900">{outlet.name}</div>
                    <div className="text-sm text-gray-500">
                      {getOutletTypeLabel(outlet.type)} • ID: {outlet.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    outlet.power === 'on' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {outlet.power.toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      setEditingOutlet(outlet);
                      registerOutlet(outlet);
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
        </div>
      )}

      {/* Registered Outlets */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Zap className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Registered Outlets</h3>
        </div>
        
        {registeredOutlets.length > 0 ? (
          <div className="space-y-3">
            {registeredOutlets.map((outlet) => (
              <div key={outlet.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(outlet.status)}
                  {getOutletTypeIcon(outlet.type)}
                  <div>
                    <div className="font-medium text-gray-900">{outlet.name}</div>
                    <div className="text-sm text-gray-500">
                      {getOutletTypeLabel(outlet.type)} • ID: {outlet.id}
                    </div>
                    {outlet.power_consumption !== undefined && (
                      <div className="text-xs text-gray-400">
                        {outlet.power_consumption.toFixed(2)}W
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    outlet.power === 'on' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {outlet.power.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setEditingOutlet(outlet)}
                    className="btn-secondary flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => unregisterOutlet(outlet.id)}
                    className="btn-danger flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No registered outlets</p>
            <p className="text-sm">Discover and register outlets to start controlling devices</p>
          </div>
        )}
      </div>

      {/* VeSync Modal */}
      {showVeSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">VeSync Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field w-full"
                  placeholder="Enter your VeSync email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field w-full pr-10"
                    placeholder="Enter your VeSync password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowVeSyncModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const emailInput = document.querySelector('input[placeholder="Enter your VeSync email"]') as HTMLInputElement;
                    const passwordInput = document.querySelector('input[placeholder="Enter your VeSync password"]') as HTMLInputElement;
                    if (emailInput?.value && passwordInput?.value) {
                      testVeSyncCredentials(emailInput.value, passwordInput.value);
                    }
                  }}
                  disabled={testing}
                  className="btn-primary"
                >
                  {testing ? 'Testing...' : 'Test & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 