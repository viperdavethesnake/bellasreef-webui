import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  className?: string;
}

export default function TabNavigation({ tabs, className = '' }: TabNavigationProps) {
  const location = useLocation();

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 