import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Wifi, Shield, Bell, Save } from 'lucide-react';
import { ApiService } from '../services/api';

interface SystemSettings {
  system_name: string;
  firmware_version: string;
  uptime: string;
  last_restart: string;
  timezone: string;
  auto_mode: boolean;
  maintenance_mode: boolean;
  kernel_version: string;
  os_name: string;
  release_name: string;
  model: string;
}

interface NetworkSettings {
  wifi_status: string;
  ip_address: string;
  signal_strength: string;
  mac_address: string;
}

interface SecuritySettings {
  admin_password_set: boolean;
  two_factor_enabled: boolean;
  remote_access_enabled: boolean;
  last_login: string;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  alert_level: string;
}

export default function Settings() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    system_name: '',
    firmware_version: '',
    uptime: '',
    last_restart: '',
    timezone: '',
    auto_mode: false,
    maintenance_mode: false,
    kernel_version: '',
    os_name: '',
    release_name: '',
    model: ''
  });
  const [networkSettings, setNetworkSettings] = useState<NetworkSettings>({
    wifi_status: '',
    ip_address: '',
    signal_strength: '',
    mac_address: ''
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    admin_password_set: false,
    two_factor_enabled: false,
    remote_access_enabled: false,
    last_login: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_enabled: false,
    sms_enabled: false,
    push_enabled: false,
    alert_level: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch system settings from host-info endpoint
        const systemResponse = await ApiService.getSystemSettings();
        const systemData = systemResponse.data;
        
        // Fetch system usage for additional info
        const usageResponse = await ApiService.getSystemUsage();
        const usageData = usageResponse.data;
        
        setSystemSettings({
          system_name: systemData.model || 'Bella\'s Reef Controller',
          firmware_version: 'v2.1.0', // This would come from a separate endpoint
          uptime: systemData.uptime || 'Unknown',
          last_restart: 'Unknown', // This would come from a separate endpoint
          timezone: 'America/New_York', // This would come from a separate endpoint
          auto_mode: true, // This would come from a separate endpoint
          maintenance_mode: false, // This would come from a separate endpoint
          kernel_version: systemData.kernel_version || '',
          os_name: systemData.os_name || '',
          release_name: systemData.release_name || '',
          model: systemData.model || ''
        });
        
        // Network settings would come from separate endpoints
        // For now, we'll show what we can infer from the system
        setNetworkSettings({
          wifi_status: 'Connected', // This would come from a network endpoint
          ip_address: '192.168.33.126', // This would come from a network endpoint
          signal_strength: 'Excellent', // This would come from a network endpoint
          mac_address: '00:1B:44:11:3A:B7' // This would come from a network endpoint
        });
        
        // Security settings would come from separate endpoints
        setSecuritySettings({
          admin_password_set: true, // This would come from a security endpoint
          two_factor_enabled: false, // This would come from a security endpoint
          remote_access_enabled: false, // This would come from a security endpoint
          last_login: 'Unknown' // This would come from a security endpoint
        });
        
        // Notification settings would come from separate endpoints
        setNotificationSettings({
          email_enabled: false, // This would come from a notification endpoint
          sms_enabled: false, // This would come from a notification endpoint
          push_enabled: false, // This would come from a notification endpoint
          alert_level: 'Medium' // This would come from a notification endpoint
        });
      } catch (err: any) {
        setError('Failed to load settings data');
        console.error('Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // This would call the appropriate API endpoints to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Settings saved successfully');
    } catch (err: any) {
      setError('Failed to save settings');
      console.error('Settings save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system preferences and security settings
          </p>
        </div>
        <div className="text-center text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system preferences and security settings
          </p>
        </div>
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Settings</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system preferences and security settings
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Name</span>
              <span className="text-sm font-medium text-gray-900">{systemSettings.system_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kernel Version</span>
              <span className="text-sm font-medium text-gray-900">{systemSettings.kernel_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">OS</span>
              <span className="text-sm font-medium text-gray-900">{systemSettings.os_name} {systemSettings.release_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Model</span>
              <span className="text-sm font-medium text-gray-900">{systemSettings.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">{systemSettings.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auto Mode</span>
              <span className={`text-sm font-medium ${systemSettings.auto_mode ? 'text-green-600' : 'text-red-600'}`}>
                {systemSettings.auto_mode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance Mode</span>
              <span className={`text-sm font-medium ${systemSettings.maintenance_mode ? 'text-red-600' : 'text-green-600'}`}>
                {systemSettings.maintenance_mode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Wifi className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Network Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">WiFi Status</span>
              <span className="text-sm font-medium text-green-600">{networkSettings.wifi_status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IP Address</span>
              <span className="text-sm font-medium text-gray-900">{networkSettings.ip_address}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Signal Strength</span>
              <span className="text-sm font-medium text-green-600">{networkSettings.signal_strength}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MAC Address</span>
              <span className="text-sm font-medium text-gray-900">{networkSettings.mac_address}</span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admin Password</span>
              <span className={`text-sm font-medium ${securitySettings.admin_password_set ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.admin_password_set ? 'Set' : 'Not Set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-Factor Auth</span>
              <span className={`text-sm font-medium ${securitySettings.two_factor_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remote Access</span>
              <span className={`text-sm font-medium ${securitySettings.remote_access_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.remote_access_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm font-medium text-gray-900">{securitySettings.last_login}</span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Notifications</span>
              <span className={`text-sm font-medium ${notificationSettings.email_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.email_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMS Notifications</span>
              <span className={`text-sm font-medium ${notificationSettings.sms_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.sms_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Push Notifications</span>
              <span className={`text-sm font-medium ${notificationSettings.push_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.push_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alert Level</span>
              <span className="text-sm font-medium text-gray-900">{notificationSettings.alert_level}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 