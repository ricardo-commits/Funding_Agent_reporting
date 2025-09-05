import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '../ui/button';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
  align = 'left'
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const isAsc = isActive && currentSort.direction === 'asc';
  const isDesc = isActive && currentSort.direction === 'desc';

  const getSortIcon = () => {
    if (isAsc) return <ChevronUp className="h-4 w-4" />;
    if (isDesc) return <ChevronDown className="h-4 w-4" />;
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const getAlignmentClass = () => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(sortKey)}
      className={`h-auto p-0 font-medium hover:bg-transparent ${getAlignmentClass()} ${className}`}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs sm:text-sm">{label}</span>
        <div className="flex-shrink-0">
          {getSortIcon()}
        </div>
      </div>
    </Button>
  );
}
