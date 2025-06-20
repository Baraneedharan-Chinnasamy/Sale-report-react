// File: components/SalesReport/hooks/useFilterManagement.js
import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useFilterManagement = (business) => {
  const [filterConfig, setFilterConfig] = useState([{ field: '', operator: '', value: '' }]);
  const [filterValues, setFilterValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch field values with cascading filter support
  const fetchFieldValues = useCallback(
    async (fieldName, searchTerm = '', page = 1, limit = 50, previousFilters = []) => {
      if (!business || !fieldName) {
        return { values: [], hasMore: false };
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const offset = (page - 1) * limit;
        
        console.log('Fetching field values with params:', {
          fieldName,
          business,
          searchTerm,
          page,
          limit,
          previousFilters
        });
        
        // Create cache key that includes previous filters
        const cacheKey = `${fieldName}-${business}-${JSON.stringify(previousFilters)}-${searchTerm}-${page}`;
        
        // Check cache first
        if (filterValues[cacheKey] && page === 1 && !searchTerm) {
          console.log('Using cached values for:', cacheKey);
          return {
            values: filterValues[cacheKey],
            hasMore: false,
            totalCount: filterValues[cacheKey].length,
            page: page + 1
          };
        }
        
        // Prepare the request parameters
        const params = {
          field_name: fieldName,
          business:"BEE7W5ND34XQZRM",
          search: searchTerm,
          offset,
          limit,
        };

        // Determine request method and configuration based on whether we have previous filters
        const requestConfig = {
          url: `${API_URL}/api/filter/field-values`,
          params,
          withCredentials: true,
        };

        // If there are previous filters, send them in the request body for cascading
        if (previousFilters && previousFilters.length > 0) {
          console.log('Using POST method with previous filters for cascading:', previousFilters);
          requestConfig.method = 'post';
          requestConfig.data = {
            filters: previousFilters.map(filter => ({
              field_name: filter.field,
              operator: filter.operator,
              value: filter.value
            }))
          };
        } else {
          console.log('Using GET method - no previous filters (first filter or no cascading)');
          requestConfig.method = 'get';
        }

        const response = await axios(requestConfig);
        
        const values = response?.data?.values || [];
        const hasMore = response?.data?.has_more ?? false;
        const totalCount = response?.data?.total_count ?? values.length;

        console.log(`Received ${values.length} values for field ${fieldName}:`, values.slice(0, 5));
        
        // Cache the results for performance (only first page without search and if we have values)
        if (page === 1 && !searchTerm && values.length > 0) {
          setFilterValues(prev => ({
            ...prev,
            [cacheKey]: values
          }));
        }

        return { 
          values, 
          hasMore, 
          totalCount,
          page: page + 1 
        };

      } catch (error) {
        console.error('Error fetching field values:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        setError(`Failed to fetch values for ${fieldName}: ${errorMessage}`);
        return { values: [], hasMore: false, totalCount: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    [business, filterValues]
  );

  // Get cached values for a field with previous filters context
  const getCachedValues = useCallback((fieldName, previousFilters = [], searchTerm = '', page = 1) => {
    const cacheKey = `${fieldName}-${business}-${JSON.stringify(previousFilters)}-${searchTerm}-${page}`;
    return filterValues[cacheKey] || [];
  }, [business, filterValues]);

  // Add a new filter
  const addFilter = useCallback(() => {
    setFilterConfig(prev => [...prev, { field: '', operator: '', value: '' }]);
  }, []);

  // Remove a filter by index
  const removeFilter = useCallback((index) => {
    setFilterConfig(prev => {
      if (prev.length <= 1) {
        // Clear all caches when resetting to single empty filter
        setFilterValues({});
        return [{ field: '', operator: '', value: '' }];
      }
      
      const newConfig = prev.filter((_, i) => i !== index);
      
      // Clear relevant caches when removing a filter
      setFilterValues(prevCache => {
        const newCache = { ...prevCache };
        // Remove cache entries that might be affected by this filter removal
        Object.keys(newCache).forEach(key => {
          if (key.includes(prev[index].field)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
      
      return newConfig;
    });
  }, []);

  // Update a specific filter property
  const updateFilter = useCallback((index, property, value) => {
    setFilterConfig(prev => {
      const newConfig = [...prev];
      if (newConfig[index]) {
        const oldField = newConfig[index].field;
        
        newConfig[index] = {
          ...newConfig[index],
          [property]: value
        };
        
        // If field is changing, clear related caches
        if (property === 'field' && oldField !== value) {
          setFilterValues(prevCache => {
            const newCache = { ...prevCache };
            Object.keys(newCache).forEach(key => {
              if (key.includes(oldField) || key.includes(value)) {
                delete newCache[key];
              }
            });
            return newCache;
          });
        }
        
        // If value is changing, clear caches for subsequent filters
        if (property === 'value') {
          setFilterValues(prevCache => {
            const newCache = { ...prevCache };
            // Clear caches for all subsequent filters when a value changes
            Object.keys(newCache).forEach(key => {
              // Parse the cache key to check if it's for a subsequent filter
              const keyParts = key.split('-');
              if (keyParts.length >= 2) {
                const fieldName = keyParts[0];
                // Clear cache for any filter that might be affected by this change
                delete newCache[key];
              }
            });
            return newCache;
          });
        }
      }
      
      return newConfig;
    });
  }, []);

  // Reset all filters to initial state
  const resetFilters = useCallback(() => {
    setFilterConfig([{ field: '', operator: '', value: '' }]);
    setFilterValues({});
    setError(null);
  }, []);

  // Apply filters - returns the current filter configuration for external use
  const applyFilters = useCallback(() => {
    // Filter out empty filters and return only valid ones
    const validFilters = filterConfig.filter(filter => 
      filter.field && 
      filter.operator && 
      hasValidFilterValue(filter)
    );
    
    console.log('Applying filters:', validFilters);
    return validFilters;
  }, [filterConfig]);

  // Helper function to validate filter values
  const hasValidFilterValue = useCallback((filter) => {
    if (!filter.value) return false;
    
    if (filter.operator === 'Between') {
      return Array.isArray(filter.value) && 
             filter.value.length === 2 && 
             filter.value[0] !== '' && 
             filter.value[1] !== '';
    } else if (filter.operator === 'In' || filter.operator === 'Not_In') {
      return Array.isArray(filter.value) && filter.value.length > 0;
    } else {
      return filter.value !== '' && filter.value !== null && filter.value !== undefined;
    }
  }, []);

  // Get all valid filters up to a specific index (for cascading)
  const getValidFiltersUpToIndex = useCallback((upToIndex) => {
    const validFilters = [];
    
    for (let i = 0; i < upToIndex && i < filterConfig.length; i++) {
      const filter = filterConfig[i];
      
      if (filter.field && filter.operator && hasValidFilterValue(filter)) {
        validFilters.push({
          field_name: filter.field,
          operator: filter.operator,
          value: filter.value
        });
      }
    }
    
    return validFilters;
  }, [filterConfig, hasValidFilterValue]);

  // Check if a filter at a specific index is complete and valid
  const isFilterValid = useCallback((index) => {
    if (index >= filterConfig.length) return false;
    
    const filter = filterConfig[index];
    return filter.field && filter.operator && hasValidFilterValue(filter);
  }, [filterConfig, hasValidFilterValue]);

  // Get the count of valid filters
  const getValidFilterCount = useCallback(() => {
    return filterConfig.filter(filter => 
      filter.field && 
      filter.operator && 
      hasValidFilterValue(filter)
    ).length;
  }, [filterConfig, hasValidFilterValue]);

  // Clear cache for a specific field
  const clearFieldCache = useCallback((fieldName) => {
    setFilterValues(prevCache => {
      const newCache = { ...prevCache };
      Object.keys(newCache).forEach(key => {
        if (key.includes(fieldName)) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    setFilterValues({});
  }, []);

  // Get filter configuration for external components
  const getFilterConfig = useMemo(() => filterConfig, [filterConfig]);

  // Get current error state
  const getError = useMemo(() => error, [error]);

  // Get current loading state
  const getIsLoading = useMemo(() => isLoading, [isLoading]);

  return {
    // State
    filterConfig: getFilterConfig,
    isLoading: getIsLoading,
    error: getError,
    fetchFieldValues,
    addFilter,
    removeFilter,
    updateFilter,
    resetFilters,
    applyFilters,
    getCachedValues,
    hasValidFilterValue,
    getValidFiltersUpToIndex,
    isFilterValid,
    getValidFilterCount,
    clearFieldCache,
    clearAllCaches
  };
};

export default useFilterManagement;