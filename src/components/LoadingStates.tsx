import React from 'react';
import { Loader2, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text = "Loading...", children }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
}

// Error State Component
interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "An error occurred while loading the data.", 
  icon,
  action,
  variant = 'error',
  className 
}: ErrorStateProps) {
  const variantStyles = {
    error: {
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      container: "border-red-200 bg-red-50"
    },
    warning: {
      icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
      container: "border-yellow-200 bg-yellow-50"
    },
    info: {
      icon: <Info className="h-12 w-12 text-blue-500" />,
      container: "border-blue-200 bg-blue-50"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center border rounded-lg",
      styles.container,
      className
    )}>
      {icon || styles.icon}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 max-w-md">{message}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-600 max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Success State Component
interface SuccessStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SuccessState({ 
  title, 
  message, 
  icon, 
  action, 
  className 
}: SuccessStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center border border-green-200 bg-green-50 rounded-lg",
      className
    )}>
      {icon || <CheckCircle className="h-12 w-12 text-green-500" />}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {message && (
        <p className="mt-2 text-sm text-gray-600 max-w-md">{message}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Data Loading Wrapper Component
interface DataLoadingWrapperProps {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  errorAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataLoadingWrapper({
  isLoading,
  error,
  isEmpty = false,
  emptyTitle = "No data found",
  emptyDescription = "There are no items to display.",
  emptyIcon,
  emptyAction,
  loadingText = "Loading...",
  errorTitle = "Failed to load data",
  errorMessage = "An error occurred while loading the data.",
  errorAction,
  children,
  className
}: DataLoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <LoadingSpinner text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        message={errorMessage}
        action={errorAction}
        className={className}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
} 