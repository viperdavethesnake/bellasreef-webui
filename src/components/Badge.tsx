import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}

// Status badge with icon
export function StatusBadge({
  status,
  text,
  icon: Icon,
  className = ''
}: {
  status: 'online' | 'offline' | 'error' | 'warning' | 'loading';
  text?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const statusConfig = {
    online: {
      variant: 'success' as const,
      text: 'Online',
      iconColor: 'text-green-500'
    },
    offline: {
      variant: 'default' as const,
      text: 'Offline',
      iconColor: 'text-gray-500'
    },
    error: {
      variant: 'error' as const,
      text: 'Error',
      iconColor: 'text-red-500'
    },
    warning: {
      variant: 'warning' as const,
      text: 'Warning',
      iconColor: 'text-yellow-500'
    },
    loading: {
      variant: 'default' as const,
      text: 'Loading',
      iconColor: 'text-gray-500'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('flex items-center space-x-1', className)}>
      {Icon && <Icon className={cn('h-3 w-3', config.iconColor)} />}
      <span>{text || config.text}</span>
    </Badge>
  );
} 