import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: 'none' | 'default' | 'colored';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = '',
  padding = 'md',
  border = 'default',
  shadow = 'sm',
  hover = false
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const borderClasses = {
    none: '',
    default: 'border border-gray-200',
    colored: 'border-l-4 border-l-blue-500 border border-gray-200'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const baseClasses = 'bg-white rounded-lg';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div className={cn(
      baseClasses,
      paddingClasses[padding],
      borderClasses[border],
      shadowClasses[shadow],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  );
}

// Specialized card variants
export function StatusCard({ 
  children, 
  status = 'default',
  className = '',
  ...props 
}: CardProps & { status?: 'success' | 'warning' | 'error' | 'info' | 'default' }) {
  const statusClasses = {
    success: 'border-l-green-500 bg-green-50',
    warning: 'border-l-yellow-500 bg-yellow-50',
    error: 'border-l-red-500 bg-red-50',
    info: 'border-l-blue-500 bg-blue-50',
    default: 'border-l-gray-500 bg-gray-50'
  };

  return (
    <Card 
      className={cn(statusClasses[status], className)}
      border="colored"
      {...props}
    >
      {children}
    </Card>
  );
}

export function MetricCard({ 
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
  ...props 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
} & Omit<CardProps, 'children'>) {
  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className={cn('text-center', className)} {...props}>
      <div className="flex items-center justify-center mb-2">
        {Icon && <Icon className="h-8 w-8 text-blue-500" />}
      </div>
      <div className={cn('text-2xl font-bold', trend ? trendClasses[trend] : 'text-gray-900')}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </Card>
  );
} 