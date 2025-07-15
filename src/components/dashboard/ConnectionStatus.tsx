import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate: string;
}

export default function ConnectionStatus({ isConnected, lastUpdate }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <Wifi className="h-5 w-5 text-green-500" />
      ) : (
        <WifiOff className="h-5 w-5 text-red-500" />
      )}
      <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      <span className="text-sm text-gray-500">
        • Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </span>
    </div>
  );
} 