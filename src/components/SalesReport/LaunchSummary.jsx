// File: components/SalesReport/LaunchSummary.jsx

import React from 'react';
import LaunchControl from './LaunchControl';
import LaunchSummaryGrid from './LaunchSummaryGrid';
import useLaunchSummary from './hooks/useLaunchSummary';
import useFieldValues from './hooks/useFieldValues';
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

  // Local filter state (array of { field, operator, value })
  const [filters, setFilters] = React.useState([
    { field: '', operator: '', value: '' }
  ]);

  // Add/Remove/Update filter logic
  const addFilter = () => setFilters([...filters, { field: '', operator: '', value: '' }]);
  const removeFilter = (index) => setFilters(filters.filter((_, i) => i !== index));
  const updateFilter = (index, property, value) => {
    setFilters(filters => {
      const newFilters = [...filters];
      newFilters[index] = { ...newFilters[index], [property]: value };
      // Optionally clear value for all subsequent filters if a previous filter changes
      for (let i = index + 1; i < newFilters.length; i++) {
        newFilters[i].value = '';
      }
      return newFilters;
    });
  };

  // Example: use useFieldValues for each filter row (for UI, see AdvancedFilters)
  // const previousFilters = filters.slice(0, index).filter(f => f.field && f.operator && f.value);
  // const { fieldValues, loading } = useFieldValues(filter.field, business, previousFilters, search, offset, limit);

  const {
    data,
    loading,
    error,
    fetchLaunchSummary
  } = useLaunchSummary();

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

  // When you need the applied filters, use:
  const appliedFilters = filters.filter(f => f.field && f.operator && f.value);

  // Use appliedFilters in your fetchLaunchSummary and other logic.

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
    
    console.log('Fetch button clicked!');
    console.log('Current fetch params:', {
      // business, // removed from log
      groupBy,
      days,
      appliedFilters,
      selectedColumns,
      launchDate: buildLaunchDateFilter(),
      ...periodParams
    });
    
    if (groupBy && days) { // removed business from check
      fetchLaunchSummary({
        days,
        groupBy,
        itemFilter: appliedFilters,
        variationColumns: selectedColumns,
        launchDateFilter: buildLaunchDateFilter(),
        ...periodParams // Spread period parameters - NEW
      });
    } else {
      console.log('Missing required fields:', { groupBy, days }); // removed business from log
    }
  };

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

      {/* Render AdvancedFilters directly */}
      <div style={{ marginTop: '12px' }}>
        <AdvancedFilters
          filters={filters}
          addFilter={addFilter}
          removeFilter={removeFilter}
          updateFilter={updateFilter}
          business={business}
        />
      </div>
      
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