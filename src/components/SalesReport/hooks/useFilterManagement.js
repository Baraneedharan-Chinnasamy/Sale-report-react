// File: components/SalesReport/hooks/useFilterManagement.js
import { useCallback, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useFilterManagement = (business) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [filterConfig, setFilterConfig] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchAvailableFields = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/filter/available-fields`, {
        params: { business }, withCredentials: true, 
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

       const response = await axios.get(`${API_URL}/api/filter/field-values`, {
        params: {
          field_name: fieldName,
          business,
          search: searchTerm,
          offset,
          limit
        },
        withCredentials: true 
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

  console.log(`\n--- updateFilter Debug ---`);
  console.log(`Field index: ${index}`);
  console.log(`Key being updated: ${key}`);
  console.log(`Incoming value:`, value);
  console.log(`Value type:`, typeof value);

  if (key === 'value') {
    if (typeof value === 'string') {
      console.log('→ Storing string value as-is');
      newConfig[index][key] = value;
    } else if (Array.isArray(value)) {
      console.log('→ Storing array value (cloned)');
      newConfig[index][key] = [...value];
    } else {
      console.log('→ Storing value (fallback)');
      newConfig[index][key] = value;
    }
  } else {
    newConfig[index][key] = value;
  }

  if (key === 'field') {
    console.log('→ Field changed, resetting value and preloading field values...');
    newConfig[index].value = [];
    fetchFieldValues(value); // preload first page
  }

  console.log('Updated filter config:', newConfig[index]);
  console.log('--------------------------\n');

  setFilterConfig(newConfig);
};



  const removeFilter = (index) => {
    const newConfig = [...filterConfig];
    newConfig.splice(index, 1);
    setFilterConfig(newConfig);
  };

  const applyFilters = () => {
  const validFilters = filterConfig.filter((f) => f.field && f.operator && f.value !== undefined && f.value !== '');

  if (validFilters.length === 0) {
    setAppliedFilters({});
    setFilterOpen(false);
    return {};
  }

  const filters = {};

  validFilters.forEach(({ field, operator, value }) => {
    const valueToStore = Array.isArray(value) ? [...value] : value;

    filters[field] = filters[field] || [];

    const existing = filters[field].find((f) => f.operator === operator);

    if (existing) {
      if (Array.isArray(existing.value) && Array.isArray(value)) {
        value.forEach((v) => {
          if (!existing.value.includes(v)) {
            existing.value.push(v);
          }
        });
      } else {
        // If value is not an array, just skip merging
        console.warn(`Skipping merge for ${field}:${operator} as value is not an array`);
      }
    } else {
      filters[field].push({ operator, value: valueToStore });
    }
  });

  console.log('✅ Final filters in applyFilters:', filters);

  setAppliedFilters(filters);
  setFilterOpen(false);
  return filters;
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
    fetchFieldValues, // <-- ensure this is always present
    getFilterParams
  };
};

export default useFilterManagement;
