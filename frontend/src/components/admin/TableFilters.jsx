import { useState } from 'react';
import Select from '@components/shared/Select';
import Button from '@components/shared/Button';
import Input from '@components/shared/Input';
import Badge from '@components/shared/Badge';
import { Filter, X } from 'lucide-react';
import { CLASS_TYPE_LABELS, SIGNUP_STATUS_LABELS } from '@utils/constants';

const TableFilters = ({ filters, onFilterChange, onClearFilters, activeFiltersCount }) => {
  const [showFilters, setShowFilters] = useState(false);

  const classTypeOptions = [
    { value: '', label: 'All Training Types' },
    ...Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(SIGNUP_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const reminderStatusOptions = [
    { value: '', label: 'All Reminders' },
    { value: 'sent', label: 'Sent' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Class Type Filter */}
          <Select
            label="Training Type"
            value={filters.classType || ''}
            onChange={(e) => onFilterChange('classType', e.target.value || null)}
            options={classTypeOptions}
          />

          {/* Status Filter */}
          <Select
            label="Signup Status"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || null)}
            options={statusOptions}
          />

          {/* Reminder Status Filter */}
          <Select
            label="Reminder Status"
            value={filters.reminderStatus || ''}
            onChange={(e) => onFilterChange('reminderStatus', e.target.value || null)}
            options={reminderStatusOptions}
          />

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Date Range</label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="Start date"
                value={filters.dateRange?.start || ''}
                onChange={(e) =>
                  onFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value || null,
                  })
                }
              />
              <Input
                type="date"
                placeholder="End date"
                value={filters.dateRange?.end || ''}
                onChange={(e) =>
                  onFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value || null,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
