// File: components/SalesReport/hooks/useFilterManagement.js
import { useCallback, useState } from 'react';
import axios from 'axios';

const useFilterManagement = (business) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [filterConfig, setFilterConfig] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchAvailableFields = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/filter/available-fields', {
        params: { business },
      });
      if (response.data?.fields) {
        setAvailableFields(response.data.fields);
      }
    } catch (error) {
      console.error('Error fetching filter fields:', error);
    }
  }, [business]);

  /**
   * Fetch values for a field with optional searchTerm and pagination (offset/page).
   */
  const fetchFieldValues = useCallback(
    async (fieldName, searchTerm = '', page = 1, limit = 50) => {
      try {
        const offset = (page - 1) * limit;

        const response = await axios.get('http://localhost:8000/api/filter/field-values', {
          params: {
            field_name: fieldName,
            business,
            search: searchTerm,
            offset,
            limit
          }
        });

        const values = response?.data?.values || [];
        const hasMore = response?.data?.has_more ?? false;

        // Optionally store first page in filterValues cache
        if (page === 1 && !searchTerm) {
          setFilterValues((prev) => ({
            ...prev,
            [fieldName]: values
          }));
        }

        return { values, hasMore };
      } catch (error) {
        console.error(`Error fetching values for ${fieldName}:`, error);
        return { values: [], hasMore: false };
      }
    },
    [business]
  );

  const addFilter = () => {
    setFilterConfig((prev) => [
      ...prev,
      { field: '', operator: 'In', value: [], values: [], showDropdown: false }
    ]);
  };

  const updateFilter = (index, key, value) => {
    const newConfig = [...filterConfig];
    newConfig[index][key] = value;

    if (key === 'field') {
      newConfig[index].value = [];
      fetchFieldValues(value); // preload first page
    }

    setFilterConfig(newConfig);
  };

  const removeFilter = (index) => {
    const newConfig = [...filterConfig];
    newConfig.splice(index, 1);
    setFilterConfig(newConfig);
  };

  const applyFilters = () => {
  const validFilters = filterConfig.filter((f) => f.field && f.operator && f.value?.length);
  if (validFilters.length === 0) {
    setAppliedFilters({});
    setFilterOpen(false);
    return {}; // ✅ return empty filters
  }

  const filters = {};

  validFilters.forEach(({ field, operator, value }) => {
    const existing = filters[field]?.find((f) => f.operator === operator);

    if (existing) {
      existing.value.push(...value.filter((v) => !existing.value.includes(v)));
    } else {
      filters[field] = filters[field] || [];
      filters[field].push({ operator, value: [...value] });
    }
  });

  setAppliedFilters(filters);
  setFilterOpen(false);
  return filters; // ✅ return applied filters immediately
};


  const resetFilters = () => {
    setFilterConfig([]);
    setAppliedFilters({});
  };

  const getFilterParams = () => {
    return Object.keys(appliedFilters).length === 0 ? null : JSON.stringify(appliedFilters);
  };

  return {
    filterOpen,
    setFilterOpen,
    availableFields,
    fetchAvailableFields,
    filterConfig,
    filterValues,
    appliedFilters,
    addFilter,
    updateFilter,
    removeFilter,
    applyFilters,
    resetFilters,
    fetchFieldValues,
    getFilterParams
  };
};

export default useFilterManagement;
