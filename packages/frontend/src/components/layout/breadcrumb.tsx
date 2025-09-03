import React from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className 
}) => {
  const matchRoute = useMatchRoute();
  
  // Auto-generate breadcrumbs from route if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/', icon: <Home className="h-4 w-4" /> }
    ];

    segments.forEach((segment, index) => {
      const to = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Handle dynamic routes
      const isDynamic = segment.startsWith('$');
      const displayLabel = isDynamic ? 'Details' : label;
      
      breadcrumbs.push({
        label: displayLabel,
        to: isDynamic ? undefined : to
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            
            <div className="flex items-center space-x-1">
              {item.icon && (
                <span className={cn(
                  'flex-shrink-0',
                  isLast ? 'text-gray-700' : 'text-gray-500'
                )}>
                  {item.icon}
                </span>
              )}
              
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className={cn(
                    'hover:text-gray-700 transition-colors',
                    isLast ? 'text-gray-900 font-medium' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  isLast ? 'text-gray-900 font-medium' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};