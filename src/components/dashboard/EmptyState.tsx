import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useDashboardStore } from '../../store/dashboard';
import { Calendar } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { resetFilters } = useDashboardStore();

  return (
    <Card className="shadow-fa">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button variant="outline" onClick={resetFilters}>
          Widen Date Range
        </Button>
      </CardContent>
    </Card>
  );
}