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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className={cn(
                    'font-medium',
                    trend.isPositive ? 'text-fa-success' : 'text-fa-danger'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}