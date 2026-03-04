// Types
export interface ServiceStatus {
  lastChecked: Date;
  latency: number;
  message?: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
}

export interface HealthMetrics {
  activeUsers: number;
  cpuUsage: number;
  databaseConnections: number;
  diskSpace: number;
  lastBackup: string | null;
  memoryUsage: number;
  responseTime: number;
  totalMemory?: number;
  uptime: number;
  usedMemory?: number;
}

// Constants
export const DEFAULT_METRICS: HealthMetrics = {
  uptime: 0,
  responseTime: 0,
  databaseConnections: 0,
  activeUsers: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  diskSpace: 0,
  lastBackup: null,
  usedMemory: 0,
  totalMemory: 0
};

// Mock data - In production, this should come from the API
export const MOCK_SERVICES: ServiceStatus[] = [
  {
    name: 'API Server',
    status: 'healthy',
    latency: 45,
    lastChecked: new Date()
  },
  {
    name: 'Database',
    status: 'healthy',
    latency: 12,
    lastChecked: new Date()
  },
  {
    name: 'Redis Cache',
    status: 'healthy',
    latency: 3,
    lastChecked: new Date()
  },
  {
    name: 'Storage Service',
    status: 'healthy',
    latency: 87,
    lastChecked: new Date()
  },
  {
    name: 'Email Service',
    status: 'healthy',
    latency: 156,
    lastChecked: new Date()
  },
  {
    name: 'SMS Gateway',
    status: 'healthy',
    latency: 234,
    lastChecked: new Date()
  }
];

// Utility functions
export const formatUptime = (seconds: number): string => {
  if (seconds <= 0) return '0d 0h 0m';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

import { Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    case 'degraded':
      return <AlertCircle className='h-4 w-4 text-yellow-500' />;
    case 'down':
      return <XCircle className='h-4 w-4 text-red-500' />;
    default:
      return <Activity className='h-4 w-4 text-gray-500' />;
  }
};
export type SystemStatus = 'healthy' | 'degraded' | 'down' | 'loading' | string;

export interface HealthData {
  /** List of service names currently experiencing issues */
  affectedServices?: string[];
  environment: string;
  /** Flag to indicate if there is an upcoming or active maintenance window */
  maintenanceScheduled?: boolean;
  status: SystemStatus;
  /** Timestamp of the check */
  timestamp?: string;
  version: string;
}
