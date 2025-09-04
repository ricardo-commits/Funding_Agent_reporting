import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[] | undefined;
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentData: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export function usePagination<T>({
  data,
  itemsPerPage = 20
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentData = useMemo(() => {
    if (!data) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };
}
