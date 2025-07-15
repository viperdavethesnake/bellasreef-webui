export interface SystemData {
  temperature: number | null;
  lighting: string | null;
  flow: string | null;
  outlets: string | null;
  alerts: number;
  lastUpdate: string;
  systemStatus: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

export interface DashboardOperation {
  id: string;
  title: string;
  icon: any;
  color: string;
  status: 'on-time' | 'due' | 'overdue' | 'completed';
  nextAction: string;
  lastAction?: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  type: 'info' | 'warning' | 'error' | 'success';
} 