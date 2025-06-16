import React, { useRef, useState, useEffect } from 'react';
import GroupbyReportControls from './GroupbyReportControls';
import AdvancedFilters from './AdvancedFilters';
import GroupbyGrid from './GroupbyGrid';
import useGroupbyReportManager from './hooks/useGroupbyReportManager';
import { exportDataToCSV } from './utils/exportUtils';

const GroupbyAggregationPage = () => {
  const gridRef = useRef();
  const [manualFieldsInput, setManualFieldsInput] = useState('');

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
    fetchAvailableFields // <-- add this
  } = useGroupbyReportManager();

  // Ensure availableFields are loaded when filter panel opens or business changes
  useEffect(() => {
    if (filterOpen && business) {
      fetchAvailableFields();
    }
  }, [filterOpen, business, fetchAvailableFields]);

  // Flush filter state and options when business changes
  useEffect(() => {
    setManualFieldsInput('');
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
  }, [business]);

  // Handle fetch data from main controls
  const handleFetchData = () => {
    // Apply filters first to get the latest filter state
    const applied = applyFilters();
    
    const payload = {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      business,
      selectedFields,
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
        business={business}
        setBusiness={setBusiness}
        groupBy={groupbyFields}
        setGroupBy={setGroupbyFields}
        selectedColumns={selectedFields}
        setSelectedColumns={setSelectedFields}
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
          business={business} // Pass business prop to AdvancedFilters
        />
      )}
      
      <div style={{ marginTop: '12px' }}> 
        <GroupbyGrid
          data={rowData}
          onCellClicked={() => {}}
          sizeColumns={[]}
          selectedColumns={selectedFields}
        />
      </div>
    </div>
  );
};

export default GroupbyAggregationPage;