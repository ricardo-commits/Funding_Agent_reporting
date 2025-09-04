import { useState, useMemo } from 'react';
import { usePagination } from './usePagination';

interface UseTableDataProps<T> {
  data: T[] | undefined;
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function useTableData<T>({
  data,
  itemsPerPage = 20,
  searchFields = []
}: UseTableDataProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  // Get nested object values (e.g., "campaigns.campaign_name")
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || !searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        
        // Handle nested objects (e.g., campaigns.campaign_name)
        if (typeof value === 'object') {
          const nestedValue = Object.values(value).join(' ').toLowerCase();
          return nestedValue.includes(query);
        }
        
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!filteredData || !sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Use pagination hook with sorted data
  const pagination = usePagination({ data: sortedData, itemsPerPage });

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    // Reset to first page when sorting
    pagination.goToPage(1);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to first page when searching
    pagination.goToPage(1);
  };

  return {
    ...pagination,
    searchQuery,
    sortConfig,
    handleSort,
    handleSearch,
    filteredData: sortedData,
    totalFilteredItems: sortedData?.length || 0
  };
}
