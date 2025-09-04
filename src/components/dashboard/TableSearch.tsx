import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X } from 'lucide-react';

interface TableSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function TableSearch({ 
  placeholder = "Search...", 
  onSearch, 
  className = "" 
}: TableSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
