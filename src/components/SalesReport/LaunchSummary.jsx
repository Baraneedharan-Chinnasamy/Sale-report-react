// File: components/SalesReport/LaunchSummary.jsx

import React from 'react';
import LaunchControl from './LaunchControl';
import LaunchSummaryGrid from './LaunchSummaryGrid';
import useLaunchSummary from './hooks/useLaunchSummary';
import useFilterManagement from './hooks/useFilterManagement';
import AdvancedFilters from './AdvancedFilters';

const LaunchSummary = () => {
  const [business, setBusiness] = React.useState('');
  const [groupBy, setGroupBy] = React.useState('item_name');
  const [days, setDays] = React.useState('60');
  const [rowData, setRowData] = React.useState([]);
  
  // Launch date filter states
  const [launchDateColumn, setLaunchDateColumn] = React.useState('');
  const [launchDate, setLaunchDate] = React.useState('');
  
  // Multi-select columns state
  const [selectedColumns, setSelectedColumns] = React.useState([]);

  // Period selection state - NEW
  const [selectedPeriods, setSelectedPeriods] = React.useState([]);

  const {
    data,
    loading,
    error,
    fetchLaunchSummary
  } = useLaunchSummary();

  const {
    filterOpen,
    setFilterOpen,
    availableFields,
    filterConfig,
    filterValues,
    appliedFilters,
    manualFetchFieldValues,
    addFilter,
    updateFilter,
    removeFilter,
    resetFilters,
    applyFilters,
    fetchAvailableFields,
    fetchFieldValues
  } = useFilterManagement(business);

  // Handle business change - clear data immediately
  React.useEffect(() => {
    if (!business) {
      setRowData([]);
      // Clear launch date filters when business changes
      setLaunchDateColumn('');
      setLaunchDate('');
      // Clear selected columns when business changes
      setSelectedColumns([]);
      // Clear selected periods when business changes
      setSelectedPeriods([]);
    }
  }, [business]);

  // Update local row data
  React.useEffect(() => {
    setRowData(data || []);
  }, [data]);

  // CSV Export
  const exportMainDataToCSV = () => {
    if (!rowData || rowData.length === 0) return;

    const columns = Object.keys(rowData[0] || {});
    const csvRows = [
      columns.join(','),
      ...rowData.map(row =>
        columns.map(col => JSON.stringify(row[col] ?? '')).join(',')
      )
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LaunchSummary_${business}_${groupBy}_${days}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build launch date filter for API call
  const buildLaunchDateFilter = () => {
    return launchDate || null;
  };

  // Calculate period parameters based on selection - NEW
  const calculatePeriodParameters = () => {
    if (!selectedPeriods || selectedPeriods.length === 0) {
      // If nothing is selected, both are false
      return {
        calculate_first_period: false,
        calculate_second_period: false
      };
    }

    return {
      calculate_first_period: selectedPeriods.includes('first_period'),
      calculate_second_period: selectedPeriods.includes('second_period')
    };
  };

  const handleApplyFilters = () => {
    const applied = applyFilters();
    const periodParams = calculatePeriodParameters(); // NEW
    
    console.log('Applied filters:', applied);
    console.log('Selected columns:', selectedColumns);
    console.log('Launch date filter:', buildLaunchDateFilter());
    console.log('Period parameters:', periodParams); // NEW
    
    // Manually fetch data after applying filters
    if (business && groupBy && days) {
      fetchLaunchSummary({
        days,
        groupBy,
        business,
        itemFilter: applied,
        variationColumns: selectedColumns,
        launchDateFilter: buildLaunchDateFilter(),
        ...periodParams // Spread period parameters - NEW
      });
    }
  };

  // Handle reset filters and fetch
  const handleResetFilters = () => {
    const emptyFilters = resetFilters();
    console.log('Reset filters');
    
    // Also reset launch date filters, selected columns, and periods
    setLaunchDateColumn('');
    setLaunchDate('');
    setSelectedColumns([]);
    setSelectedPeriods([]); // NEW
    
    // Manually fetch data after resetting filters
    if (business && groupBy && days) {
      fetchLaunchSummary({
        days,
        groupBy,
        business,
        itemFilter: emptyFilters,
        variationColumns: [],
        launchDateFilter: null,
        calculate_first_period: false, // NEW
        calculate_second_period: false // NEW
      });
    }
  };

  // Handle business change from LaunchControl - NO AUTO FETCH
  const handleBusinessChange = (newBusiness) => {
    console.log('Business changed to:', newBusiness);
    setBusiness(newBusiness);
    setRowData([]); // Clear existing data
    setLaunchDateColumn(''); // Clear launch date filters
    setLaunchDate('');
    setSelectedColumns([]); // Clear selected columns
    setSelectedPeriods([]); // Clear selected periods - NEW
  };

  // Manual fetch function that only runs when Fetch button is clicked
  const handleManualFetch = () => {
    const periodParams = calculatePeriodParameters(); // NEW
    
    console.log('Manual fetch triggered');
    console.log('Selected columns:', selectedColumns);
    console.log('Selected periods:', selectedPeriods); // NEW
    console.log('Period parameters:', periodParams); // NEW
    console.log('Launch date filter:', { launchDateColumn, launchDate });
    
    if (business && groupBy && days) {
      fetchLaunchSummary({
        days,
        groupBy,
        business,
        itemFilter: appliedFilters,
        variationColumns: selectedColumns,
        launchDateFilter: buildLaunchDateFilter(),
        ...periodParams // Spread period parameters - NEW
      });
    } else {
      console.log('Missing required fields:', { business, groupBy, days });
    }
  };

  // Ensure availableFields are loaded when filter panel opens or business changes
  React.useEffect(() => {
    if (filterOpen && business) {
      fetchAvailableFields();
    }
  }, [filterOpen, business, fetchAvailableFields]);

  // Flush filter state and options when business changes
  React.useEffect(() => {
    setRowData([]);
    setLaunchDateColumn('');
    setLaunchDate('');
    setSelectedColumns([]);
    setSelectedPeriods([]); // NEW
    
    // Reset filterConfig, availableFields, and filterValues for AdvancedFilters
    if (filterOpen) {
      setFilterOpen(false);
      setTimeout(() => setFilterOpen(true), 0);
    }
    // Explicitly clear filterConfig, filterValues, and availableFields
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

  return (
    <div>
      <h2>Launch Summary</h2>

      <LaunchControl
        business={business}
        setBusiness={handleBusinessChange}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        days={days}
        setDays={setDays}
        fetchData={handleManualFetch}
        exportMainDataToCSV={exportMainDataToCSV}
        rowData={rowData}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        appliedFilters={appliedFilters}
        loading={loading}
        // Launch date filter props
        launchDateColumn={launchDateColumn}
        setLaunchDateColumn={setLaunchDateColumn}
        launchDate={launchDate}
        setLaunchDate={setLaunchDate}
        // Multi-select columns props
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        // Period selection props - NEW
        selectedPeriods={selectedPeriods}
        setSelectedPeriods={setSelectedPeriods}
      />

      {/* Inline Advanced Filters block (not modal) */}
      {filterOpen && (
        <div style={{ marginTop: '12px' }}>
          <AdvancedFilters
            filterConfig={filterConfig}
            availableFields={availableFields}
            filterValues={filterValues}
            fetchFieldValues={fetchFieldValues}
            updateFilter={updateFilter}
            removeFilter={removeFilter}
            addFilter={addFilter}
            resetFilters={handleResetFilters}
            applyFilters={handleApplyFilters}
            business={business}
          />
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <LaunchSummaryGrid
          data={rowData}
          selectedColumns={rowData[0] ? Object.keys(rowData[0]) : []}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default LaunchSummary;