import { create } from 'zustand';
import { getAllSignups } from '@services/adminService';
import { CLASS_TYPES, SIGNUP_STATUS } from '@utils/constants';

const useAdminStore = create((set, get) => ({
  // Data state
  allSignups: [],
  isLoading: false,
  loadError: null,
  lastFetchedAt: null,

  // Pagination state (frontend-only)
  currentPage: 1,
  pageSize: 10,

  // Filter state
  filters: {
    classType: null,
    status: null,
    dateRange: {
      start: null,
      end: null,
    },
    reminderStatus: null, // null | 'sent' | 'pending' | 'failed'
  },

  // Search state
  searchQuery: '',

  // Sort state
  sortConfig: {
    field: 'createdAt',
    direction: 'desc', // 'asc' | 'desc'
  },

  // Selection state (for bulk operations)
  selectedSignupIds: [],

  // Actions - Data Fetching
  fetchAllSignups: async () => {
    set({ isLoading: true, loadError: null });

    try {
      const response = await getAllSignups();
      // Backend returns { data: { signups: [...], pagination: {...} } }
      // After axios interceptor, we get the full response object
      const signups = response.data?.signups || response.signups || [];
      set({
        allSignups: signups,
        isLoading: false,
        lastFetchedAt: new Date(),
        loadError: null,
      });
    } catch (error) {
      console.error('Failed to fetch signups:', error);
      set({
        isLoading: false,
        loadError: error.message || 'Failed to load signups',
      });
    }
  },

  refreshData: async () => {
    await get().fetchAllSignups();
  },

  // Actions - Pagination
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 }); // Reset to page 1 when changing page size
  },

  nextPage: () => {
    const { currentPage, getTotalPages } = get();
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  previousPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  // Actions - Filtering
  setFilter: (filterKey, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterKey]: value,
      },
      currentPage: 1, // Reset to page 1 when filters change
    }));
  },

  setDateRangeFilter: (start, end) => {
    set((state) => ({
      filters: {
        ...state.filters,
        dateRange: { start, end },
      },
      currentPage: 1,
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        classType: null,
        status: null,
        dateRange: { start: null, end: null },
        reminderStatus: null,
      },
      currentPage: 1,
    });
  },

  // Actions - Search
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 }); // Reset to page 1 when search changes
  },

  // Actions - Sorting
  setSortConfig: (field, direction) => {
    set({ sortConfig: { field, direction } });
  },

  toggleSortDirection: (field) => {
    const { sortConfig } = get();
    const newDirection =
      sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    set({ sortConfig: { field, direction: newDirection } });
  },

  // Actions - Selection
  toggleSignupSelection: (signupId) => {
    set((state) => {
      const isSelected = state.selectedSignupIds.includes(signupId);
      return {
        selectedSignupIds: isSelected
          ? state.selectedSignupIds.filter((id) => id !== signupId)
          : [...state.selectedSignupIds, signupId],
      };
    });
  },

  selectAllSignups: () => {
    const { getFilteredAndSearchedSignups } = get();
    const allSignupIds = getFilteredAndSearchedSignups().map((signup) => signup.id);
    set({ selectedSignupIds: allSignupIds });
  },

  clearSelection: () => {
    set({ selectedSignupIds: [] });
  },

  // Computed Getters
  getFilteredAndSearchedSignups: () => {
    const { allSignups, filters, searchQuery, sortConfig } = get();

    let filtered = [...allSignups];

    // Apply class type filter
    if (filters.classType) {
      filtered = filtered.filter((signup) => signup.classType === filters.classType);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((signup) => signup.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((signup) => {
        const signupDate = new Date(signup.createdAt);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (start && signupDate < start) return false;
        if (end && signupDate > end) return false;
        return true;
      });
    }

    // Apply reminder status filter
    if (filters.reminderStatus) {
      filtered = filtered.filter((signup) => {
        if (filters.reminderStatus === 'sent') return signup.reminderSentAt !== null;
        if (filters.reminderStatus === 'pending') return signup.reminderSentAt === null;
        if (filters.reminderStatus === 'failed') return signup.status === SIGNUP_STATUS.FAILED;
        return true;
      });
    }

    // Apply search query
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((signup) => {
        const email = signup.student?.email?.toLowerCase() || '';
        const phone = signup.student?.phone?.toLowerCase() || '';
        const classType = signup.classType?.toLowerCase() || '';
        const status = signup.status?.toLowerCase() || '';

        return (
          email.includes(query) ||
          phone.includes(query) ||
          classType.includes(query) ||
          status.includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date || typeof aValue === 'number') {
        comparison = aValue - bValue;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  },

  getPaginatedSignups: () => {
    const { getFilteredAndSearchedSignups, currentPage, pageSize } = get();
    const filtered = getFilteredAndSearchedSignups();

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filtered.slice(startIndex, endIndex);
  },

  getTotalPages: () => {
    const { getFilteredAndSearchedSignups, pageSize } = get();
    const filtered = getFilteredAndSearchedSignups();
    return Math.ceil(filtered.length / pageSize);
  },

  getTotalCount: () => {
    const { getFilteredAndSearchedSignups } = get();
    return getFilteredAndSearchedSignups().length;
  },

  getActiveFiltersCount: () => {
    const { filters, searchQuery } = get();
    let count = 0;

    if (filters.classType) count++;
    if (filters.status) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.reminderStatus) count++;
    if (searchQuery && searchQuery.trim() !== '') count++;

    return count;
  },
}));

export default useAdminStore;
