import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useFilterManagement from './useFilterManagement';

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

  const {
    filterOpen,
    setFilterOpen,
    availableFields,
    filterConfig,
    filterValues,
    appliedFilters,
    addFilter,
    updateFilter,
    removeFilter,
    resetFilters,
    applyFilters,
    fetchAvailableFields,
    fetchFieldValues,
    getFilterParams,
  } = useFilterManagement(business);

  const fetchGroupbyData = useCallback(async (externalPayload = null) => {
    const filterParams = getFilterParams() || {};

    // Optional external payload (e.g., from GroupbyAggregationPage)
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
      filters,
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
    if (filters && Object.keys(filters).length > 0) {
    params.item_filter = JSON.stringify(filters);}


    console.log('Fetching with params:', params);

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/groupby-summary`, { params ,
         withCredentials: true });
      const data = res.data?.data || [];
      setRowData(data);
    } catch (err) {
      console.error('Error fetching groupby data:', err);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [business, startDate, endDate, groupbyFields, selectedFields, getFilterParams]);
  // Always use fetchFieldValues from useFilterManagement (manualFetchFieldValues does not exist here)
  return {
    startDate, setStartDate,
    endDate, setEndDate,
    business, setBusiness,
    groupbyFields, setGroupbyFields,
    selectedFields, setSelectedFields,
    rowData, fetchGroupbyData, loading,
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
    fetchFieldValues, // ensure this is the one from useFilterManagement
    fetchAvailableFields,
    getFilterParams,
    availableColumns
  };
};

export default useGroupbyReportManager;
