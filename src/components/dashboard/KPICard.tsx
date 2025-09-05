import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  className 
}: KPICardProps) {
  return (
    <Card className={cn('shadow-fa border-border', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <span
                  className={cn(
                    'font-medium',
                    trend.isPositive ? 'text-fa-success' : 'text-fa-danger'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground hidden sm:inline">vs last period</span>
                <span className="text-muted-foreground sm:hidden">vs last</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 ml-2">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}