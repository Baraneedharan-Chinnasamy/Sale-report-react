import React, { useRef, useState } from 'react';
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
    fetchFieldValues
  } = useGroupbyReportManager();

  const handleManualFieldApply = () => {
    const fields = manualFieldsInput
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
    if (fields.length > 0) {
      setSelectedFields(prev => Array.from(new Set([...prev, ...fields])));
    }
  };

  // ✅ Only include non-empty values in payload
  const handleFetchData = () => {
   const applied = applyFilters(); // This now returns fresh filters
    const payload = {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      business,
      selectedFields,
      groupbyFields,
      filters: applied, // ✅ use fresh filters
    };


    fetchGroupbyData(payload);
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
          columns.map(col => ({ field: col })), // or pass full col defs if available
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
          applyFilters={handleFetchData} // ✅ uses clean payload
          fetchFieldValues={fetchFieldValues}
        />
      )}
      <div style={{ marginTop: '12px' }}> 
      <GroupbyGrid
        data={rowData}
        onCellClicked={() => {}}
        sizeColumns={[]}
        selectedColumns={selectedFields} // ✅ Pass this to reflect arranged order
      />
      </div>
    </div>
  );
};

export default GroupbyAggregationPage;
