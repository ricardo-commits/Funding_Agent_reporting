/* LEADS PAGE COMMENTED OUT - All original functionality has been disabled

import { useState } from 'react';
import { useEmailLeads, useLeadEmailResponses } from '../hooks/useDashboardData';
import { useTableData } from '../hooks/useTableData';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { TablePagination } from '../components/dashboard/TablePagination';
import { TableSearch } from '../components/dashboard/TableSearch';
import { SortableHeader } from '../components/dashboard/SortableHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import type { EmailLead } from '../types/dashboard';

export default function Leads() {
  const [selectedLead, setSelectedLead] = useState<EmailLead | null>(null);
  
  const { data: leads, isLoading } = useEmailLeads();
  const { data: leadResponses } = useLeadEmailResponses(selectedLead?.id || '');

  const {
    currentData: paginatedLeads,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    searchQuery,
    sortConfig,
    handleSort,
    handleSearch,
    totalFilteredItems
  } = useTableData({
    data: leads,
    itemsPerPage: 20,
    searchFields: ['company_name', 'full_name', 'campaigns']
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-8">
      [... full component implementation was here ...]
    </div>
  );
}

*/

// Leads page has been commented out as requested
export default function Leads() {
  return (
    <div className="p-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Leads Page Disabled</h2>
        <p className="text-muted-foreground mt-2">
          The leads page has been temporarily disabled.
        </p>
      </div>
    </div>
  );
}