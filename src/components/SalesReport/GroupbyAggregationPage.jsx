import React, { useRef, useState, useEffect } from 'react';
import GroupbyReportControls from './GroupbyReportControls';
import AdvancedFilters from './AdvancedFilters';
import GroupbyGrid from './GroupbyGrid';
import useGroupbyReportManager from './hooks/useGroupbyReportManager';
import { exportDataToCSV } from './utils/exportUtils';

// Map business code to name
const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham", 
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const GroupbyAggregationPage = () => {
  const gridRef = useRef();
  const [manualFieldsInput, setManualFieldsInput] = useState('');
  const [aggregationColumns, setAggregationColumns] = useState([]);

  const {
    startDate, setStartDate,
    endDate, setEndDate,
    business, setBusiness,
    groupbyFields, setGroupbyFields,
    selectedFields, setSelectedFields,
    loading, rowData,
    fetchGroupbyData,
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
  } = useGroupbyReportManager();

  // Get business from localStorage and map to business code
  const currentBusiness = React.useMemo(() => {
    try {
      const businessName = localStorage.getItem('selectedBusiness') || '';
      return Object.keys(BUSINESS_CODE_MAP).find(
        code => BUSINESS_CODE_MAP[code] === businessName
      ) || ''; // return business code or empty string if not found
    } catch (error) {
      console.error('Error getting business from localStorage:', error);
      return '';
    }
  }, []);

  // Ensure availableFields are loaded when filter panel opens or business changes
  useEffect(() => {
    if (filterOpen && currentBusiness) {
      fetchAvailableFields();
    }
  }, [filterOpen, currentBusiness, fetchAvailableFields]);

  // Flush filter state and options when business changes
  useEffect(() => {
    setManualFieldsInput('');
    setSelectedFields([]);
    setAggregationColumns([]);
    setGroupbyFields([]);
    
    // Reset filterConfig, availableFields, and filterValues for AdvancedFilters
    if (filterOpen) {
      setFilterOpen(false);
      setTimeout(() => setFilterOpen(true), 0);
    }
    if (Array.isArray(filterConfig) && filterConfig.length > 0) {
      filterConfig.splice(0, filterConfig.length);
    }
    if (availableFields && availableFields.length > 0) {
      availableFields.splice(0, availableFields.length);
    }
    if (filterValues && Object.keys(filterValues).length > 0) {
      Object.keys(filterValues).forEach(key => delete filterValues[key]);
    }
  }, [currentBusiness]);

  // Handle fetch data from main controls
  const handleFetchData = () => {
    // Apply filters first to get the latest filter state
    const applied = applyFilters();
    
    const payload = {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      business: currentBusiness, // Now passing business code
      selectedFields: [...selectedFields, ...aggregationColumns], // Combine both column types
      groupbyFields,
      filters: applied,
    };

    console.log('Fetching with payload:', payload);
    fetchGroupbyData(payload);
  };

  // Handle apply filters from AdvancedFilters component
  const handleApplyFilters = () => {
    // This will both apply filters and fetch data
    handleFetchData();
  };

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
        Groupby Aggregation Report
      </h1>

      <GroupbyReportControls
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        groupBy={groupbyFields}
        setGroupBy={setGroupbyFields}
        selectedColumns={selectedFields}
        setSelectedColumns={setSelectedFields}
        aggregationColumns={aggregationColumns}
        setAggregationColumns={setAggregationColumns}
        exportMainDataToCSV={(columns) =>
          exportDataToCSV(
            rowData,
            columns.map(col => ({ field: col })),
            'groupby_report.xlsx',
            groupbyFields
          )
        }
        appliedFilters={appliedFilters}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        fetchData={handleFetchData} 
        loading={loading}
        rowData={rowData}
      />

      {filterOpen && (
        <AdvancedFilters
          filterConfig={filterConfig}
          availableFields={availableFields}
          filterValues={filterValues}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
          addFilter={addFilter}
          resetFilters={resetFilters}
          applyFilters={handleApplyFilters}
          fetchFieldValues={fetchFieldValues}
          business={currentBusiness} // Pass current business from localStorage
        />
      )}
      
      <div style={{ marginTop: '12px' }}> 
        <GroupbyGrid
          data={rowData}
          onCellClicked={() => {}}
          sizeColumns={[]}
          selectedColumns={[...selectedFields, ...aggregationColumns]} // Show both column types in grid
        />
      </div>
    </div>
  );
};

export default GroupbyAggregationPage;
