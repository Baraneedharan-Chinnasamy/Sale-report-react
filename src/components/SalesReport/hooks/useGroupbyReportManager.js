import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useGroupbyReportManager = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [business, setBusiness] = useState('');
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);

  const [groupbyFields, setGroupbyFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);

  // Filter-related state
  const [filterOpen, setFilterOpen] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [filterConfig, setFilterConfig] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchGroupbyData = useCallback(async (externalPayload = null) => {
    // Use local filters state or allow external override
    const payload = externalPayload || {
      business,
      startDate,
      endDate,
      groupbyFields,
      selectedFields,
      filters: appliedFilters,
    };

    const {
      business: biz,
      startDate: start,
      endDate: end,
      groupbyFields: groupby,
      selectedFields: selected,
      filters: filterVals,
    } = payload;

    if (!biz) {
      alert("Business ID is required.");
      return;
    }

    const params = {
      business: biz,
      groupby: JSON.stringify(groupby || []),
      data_fields: JSON.stringify([...new Set([...(groupby || []), ...(selected || [])])]),
    };

    if (start) params.Start_Date = start;
    if (end) params.End_Date = end;
    if (filterVals && Object.keys(filterVals).length > 0) {
      params.item_filter = JSON.stringify(filterVals);
    }

    console.log('Fetching with params:', params);

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/groupby-summary`, { 
        params,
        withCredentials: true 
      });
      const data = res.data?.data || [];
      setRowData(data);
    } catch (err) {
      console.error('Error fetching groupby data:', err);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [business, startDate, endDate, groupbyFields, selectedFields, appliedFilters]);

  // Filter management functions
  const addFilter = useCallback(() => {
    const newFilter = {
      id: Date.now(),
      field: '',
      operator: 'equals',
      value: '',
      values: []
    };
    setFilterConfig(prev => [...prev, newFilter]);
  }, []);

  const updateFilter = useCallback((id, updates) => {
    setFilterConfig(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  }, []);

  const removeFilter = useCallback((id) => {
    setFilterConfig(prev => prev.filter(filter => filter.id !== id));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterConfig([]);
    setFilterValues({});
    setAppliedFilters({});
  }, []);

  const applyFilters = useCallback(() => {
    // Convert filterConfig to the format expected by the API
    const applied = {};
    
    filterConfig.forEach(filter => {
      if (filter.field && (filter.value || (filter.values && filter.values.length > 0))) {
        applied[filter.field] = {
          operator: filter.operator,
          value: filter.operator === 'in' ? filter.values : filter.value
        };
      }
    });

    setAppliedFilters(applied);
    return applied;
  }, [filterConfig]);

  const fetchFieldValues = useCallback(async (fieldName) => {
    if (!business || !fieldName) return [];
    
    try {
      // This is a placeholder - replace with your actual API call
      const response = await axios.get(`${API_URL}/api/field-values`, {
        params: { business, field: fieldName },
        withCredentials: true
      });
      return response.data?.values || [];
    } catch (error) {
      console.error('Error fetching field values:', error);
      return [];
    }
  }, [business]);

  const fetchAvailableFields = useCallback(async () => {
    if (!business) return;
    
    try {
      // This is a placeholder - replace with your actual API call
      const response = await axios.get(`${API_URL}/api/available-fields`, {
        params: { business },
        withCredentials: true
      });
      setAvailableFields(response.data?.fields || []);
    } catch (error) {
      console.error('Error fetching available fields:', error);
      setAvailableFields([]);
    }
  }, [business]);

  return {
    startDate, setStartDate,
    endDate, setEndDate,
    business, setBusiness,
    groupbyFields, setGroupbyFields,
    selectedFields, setSelectedFields,
    rowData, fetchGroupbyData, loading,
    availableColumns,
    
    // Filter-related exports
    filterOpen, setFilterOpen,
    availableFields,
    filterConfig,
    filterValues,
    appliedFilters,
    addFilter,
    updateFilter,
    removeFilter,
    resetFilters,
    applyFilters,
    fetchFieldValues,
    fetchAvailableFields
  };
};

export default useGroupbyReportManager;