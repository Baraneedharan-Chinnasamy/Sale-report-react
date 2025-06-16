import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReportControls from './ReportControls';
import AdvancedFilters from './AdvancedFilters';
import MainDataGrid from './MainDataGrid';
import DetailsModal from './DetailsModal';
import SizeDetailsModal from './SizeDetailsModal';
import useFetchData from './hooks/useFetchData';
import useFilterManagement from './hooks/useFilterManagement';
import useDetailFetcher from './hooks/useDetailFetcher';
import { exportDataToCSV } from './utils/exportUtils';
import styles from './styles/SalesReport.module.css';
import TargetManagerModal from './TargetManagerModal';
import ReportSummary from './ReportSummary';
import { prepareSizeDetails } from './SizeDetailsModal';


const SalesReportGrid = () => {
  const gridRef = useRef();
  const modalGridRef = useRef();
  const nestedModalGridRef = useRef();

  const [aggregation, setAggregation] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [business, setBusiness] = useState('');
  const [groupByField, setGroupByField] = useState('');
  const [currentRowDate, setCurrentRowDate] = useState({ startDate: '', endDate: '', aggregation: 'daily' });
  const [compareStartDate, setCompareStartDate] = useState('');
  const [compareEndDate, setCompareEndDate] = useState('');


  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sizeColumns, setSizeColumns] = useState([]);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [summary, setSummary] = useState(null);


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
    getFilterParams
  } = useFilterManagement(business);

  const {
    fetchData
  } = useFetchData({
    aggregation: aggregation.trim(),
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    business: business.trim(),
    sizeColumns,
    getFilterParams,
    setLoading,
    setRowData,
    setColumnDefs,
    setSummary,
    compareStartDate,   
    compareEndDate  
  });

  
 


  const {
    modalRowData,
    modalColumnDefs,
    nestedModalRowData,
    nestedModalColumnDefs,
    modalTitle,
    nestedModalTitle,
    modalLoading,
    showModal,
    showNestedModal,
    showModalExport,
    fetchDetailsData,
    fetchFullData,
    closeModal,
    closeNestedModal,
    setModalTitle,
    setShowModal,
    setNestedModalRowData,
    setNestedModalColumnDefs,
    setNestedModalTitle,
    setShowNestedModal
  } = useDetailFetcher({ business, aggregation, getFilterParams, startDate, endDate });

  useEffect(() => {
    const isAgeBusiness = business === 'BEE7W5ND34XQZRM' || business === 'ADBXOUERJVK038L';
    setSizeColumns(
      isAgeBusiness
        ? ['Sales_By_Age', 'Stock_By_Age']
        : ['Sales_By_Size', 'Stock_By_Size']
    );
  }, [business]);
  
  useEffect(() => {
  if (business === 'BEE7W5ND34XQZRM') {
    setGroupByField('Product_Type');
  } else {
    setGroupByField('Category');
  }
  }, [business]);


  useEffect(() => {
    fetchAvailableFields();
  }, [fetchAvailableFields]);

  const exportMainDataToCSV = () => {
    exportDataToCSV(rowData, columnDefs, `Sales_Report_${startDate}_to_${endDate}.csv`);
  };

  const exportModalDataToCSV = () => {
    exportDataToCSV(modalRowData, modalColumnDefs, `${modalTitle.replace(/ /g, '_')}_Details.csv`);
  };

  const exportNestedModalDataToCSV = () => {
    exportDataToCSV(nestedModalRowData, nestedModalColumnDefs, `${nestedModalTitle.replace(/ /g, '_')}_Details.csv`);
  };

  // This function now handles both direct cell clicks and clicks from button renderer
  const onCellClicked = useCallback((params) => {
    // Normalize the parameters whether they come from ag-grid cell click or view button click
    const field = params.colDef?.field;
    const value = params.value;
    const data = params.data;

    // Handle size columns
    if (sizeColumns.includes(field) && value) {
        const gridData = prepareSizeDetails(value, field.replaceAll('_', ' '));

      if (gridData) {
        setNestedModalRowData(gridData.rowData);
        setNestedModalColumnDefs(gridData.columnDefs);
        setNestedModalTitle(gridData.title);
        setShowNestedModal(true);
        setTimeout(() => {
          nestedModalGridRef.current?.api?.sizeColumnsToFit();
        }, 200);
      }
      return;
    }

    // Handle date field for showing detailed report
    if (field === 'Date' || params.colDef?.headerName === 'Date') {
      const { startDate: s, endDate: e } = parseDateField(data.Date);
      
      // Update the current row date with the outer grid dates and aggregation
      setCurrentRowDate({ 
        startDate: s, 
        endDate: e, 
        aggregation 
      });
      
      setGroupByField(business === 'BEE7W5ND34XQZRM' ? 'Product_Type' : 'Category');
      setShowModal(true);
      setModalTitle(`Details Sales Report`);

      applyFilters();
      const defaultGroup = business === 'BEE7W5ND34XQZRM' ? 'Product_Type' : 'Category';
      fetchDetailsData(s, e, defaultGroup);


    }
  }, [aggregation, sizeColumns, setCurrentRowDate, setGroupByField, setShowModal, setModalTitle, applyFilters, fetchDetailsData, setNestedModalRowData, setNestedModalColumnDefs, setNestedModalTitle, setShowNestedModal]);

  const handleGroupByChange = async (selectedGroup) => {
    setGroupByField(selectedGroup);
    await fetchDetailsData(currentRowDate.startDate, currentRowDate.endDate, selectedGroup);
  };

  // Flush filter state and options when business changes
  useEffect(() => {
    setRowData([]);
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

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Sales Report</h1>

      <ReportControls
        aggregation={aggregation}
        setAggregation={setAggregation}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        compareStartDate={compareStartDate}
        setCompareStartDate={setCompareStartDate}
        compareEndDate={compareEndDate}
        setCompareEndDate={setCompareEndDate}
        business={business}
        setBusiness={setBusiness}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        appliedFilters={appliedFilters}
        fetchData={fetchData}
        exportMainDataToCSV={exportMainDataToCSV}
        rowData={rowData}
        setTargetModalOpen={setTargetModalOpen}
        loading={loading}
      />
      
      
      {filterOpen && (
        <>
          <AdvancedFilters
            business={business}
            filterConfig={filterConfig}
            availableFields={availableFields}
            filterValues={filterValues}
            updateFilter={updateFilter}
            removeFilter={removeFilter}
            addFilter={addFilter}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            appliedFilters={appliedFilters}
            fetchFieldValues={fetchFieldValues}
          />
          <div style={{ marginBottom: '12px' }}></div>
        </>
      )}
     
      <ReportSummary summary={summary} />
      <div style={{ marginTop: '18px' }}></div>
      <MainDataGrid
        gridRef={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        onCellClicked={onCellClicked}
        sizeColumns={sizeColumns}
      />

      <DetailsModal
        showModal={showModal}
        closeModal={closeModal}
        modalTitle={modalTitle}
        modalGridRef={modalGridRef}
        modalRowData={modalRowData}
        modalColumnDefs={modalColumnDefs}
        modalLoading={modalLoading}
        showModalExport={showModalExport}
        exportModalDataToCSV={exportModalDataToCSV}
        onCellClicked={onCellClicked}
        groupByField={groupByField}
        handleGroupByChange={handleGroupByChange}
        appliedFilters={appliedFilters}
        setFilterOpen={setFilterOpen}
        business={business}
        fetchFullData={fetchFullData}
        currentRowDate={currentRowDate}
        sizeColumns={sizeColumns}
      />

      <SizeDetailsModal
        showNestedModal={showNestedModal}
        closeNestedModal={closeNestedModal}
        nestedModalTitle={nestedModalTitle}
        nestedModalGridRef={nestedModalGridRef}
        nestedModalRowData={nestedModalRowData}
        nestedModalColumnDefs={nestedModalColumnDefs}
        exportNestedModalDataToCSV={exportNestedModalDataToCSV}
      />


      <TargetManagerModal
      isOpen={targetModalOpen}
      onClose={() => setTargetModalOpen(false)}
      businessName={business}
    />

    </div>
  );
};

const parseDateField = (dateField) => {
  if (dateField.includes('to')) {
    const [start, end] = dateField.split('to').map((d) => d.trim());
    return { startDate: start, endDate: end };
  } else {
    return { startDate: dateField.trim(), endDate: dateField.trim() };
  }
};

const formatSizeDetails = (rawData, titleLabel) => {
  if (!rawData || typeof rawData !== 'object') return null;

  const rowData = Object.entries(rawData).map(([key, value]) => ({
    Label: key,
    Quantity: typeof value === 'number' ? value : parseInt(value) || 0,
  }));

  const columnDefs = [
    {
      headerName: 'Label',
      field: 'Label',
      flex: 1,
      cellStyle: { fontWeight: 500, color: '#334155' },
    },
    {
      headerName: 'Quantity',
      field: 'Quantity',
      flex: 1,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#1e293b' },
      valueFormatter: (params) => isNaN(params.value) ? '—' : params.value.toLocaleString('en-IN'),
    },
  ];

  return {
    rowData,
    columnDefs,
    title: titleLabel,
  };
};


export default SalesReportGrid;