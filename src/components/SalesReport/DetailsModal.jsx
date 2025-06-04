import React, { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ArrowDownTrayIcon, FunnelIcon, TrashIcon } from '@heroicons/react/24/solid';
import useExportToSheet from './hooks/useExportToSheet';
import ViewButtonRenderer from './ViewButtonRenderer';
import reportStyles from './styles/ReportControls.module.css';
import formStyles from './styles/formControls.module.css';
import modalStyles from './styles/DetailsModal.module.css';

const DetailsModal = ({
  showModal,
  closeModal,
  modalTitle,
  modalGridRef,
  modalRowData,
  modalColumnDefs,
  modalLoading,
  showModalExport,
  exportModalDataToCSV,
  onCellClicked,
  groupByField,
  handleGroupByChange,
  appliedFilters,
  setFilterOpen,
  business,
  fetchFullData,
  currentRowDate,
  sizeColumns = []
}) => {
  const [selectedGroupings, setSelectedGroupings] = useState(groupByField ? groupByField.split(',') : []);
  
  useEffect(() => {
    if (showModal) {
      setSelectedGroupings(groupByField ? groupByField.split(',') : []);
    }
  }, [showModal, groupByField]);

  const { exportToGoogleSheet } = useExportToSheet();

  // Format Indian currency with ₹ symbol and comma separators
  const formatIndianCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '—';
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Format with Indian numbering system (lakh, crore)
    const formattedValue = numValue.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      style: 'decimal'
    });
    
    return `₹ ${formattedValue}`;
  };

  // Enhanced modal column definition with proper formatting
  const enhancedModalColumnDefs = useMemo(() => {
    if (!modalRowData || modalRowData.length === 0) return modalColumnDefs;

    const columns = modalColumnDefs.map((col) => {
      const key = col.field;
      const fieldLower = key?.toLowerCase?.() || '';
      const headerLower = col.headerName?.toLowerCase?.() || '';
      const enhancedCol = { ...col };
      
      if (key === 'Sales_By_Size' || key === 'Stock_By_Size' || key === 'Stock_By_Age' || key === 'Sales_By_Age') {
        enhancedCol.cellRenderer = ViewButtonRenderer;
      } 

      // Growth percentage formatter
      if (key === "Sale_Growth_Percentage" || fieldLower.includes("growth") || headerLower.includes("growth")) {
        enhancedCol.cellRenderer = (params) => {
          const val = params.value;
          if (val === null || val === undefined || val === "N/A" || isNaN(val)) return '—';
          const value = parseFloat(val);
          const isPositive = value >= 0;
          const arrow = isPositive ? '▲' : '▼';
          const color = isPositive ? 'green' : 'red';
          return <span style={{ color, fontWeight: 'bold' }}>{arrow} {Math.abs(value).toFixed(2)}%</span>;
        };
      }

      // Deviation percentage formatter
      if (key === "%_Deviation" || fieldLower.includes("deviation") || headerLower.includes("deviation")) {
        enhancedCol.cellRenderer = (params) => {
          const val = params.value;
          if (val === null || val === undefined || val === "N/A" || isNaN(val)) return '—';
          const value = parseFloat(val);
          const isPositive = value >= 0;
          const arrow = isPositive ? '▲' : '▼';
          const color = isPositive ? 'green' : 'red';
          return <span style={{ color, fontWeight: 'bold' }}>{arrow} {Math.abs(value).toFixed(2)}%</span>;
        };
      }

      // Sell through rate formatter
      if (key === "Sell_Through_Rate" || fieldLower.includes("sell_through") || headerLower.includes("sell through")) {
        enhancedCol.cellRenderer = (params) => {
          const val = parseFloat(params.value);
          if (isNaN(val) || val === null || val === undefined) return '—';
          return <span style={{ fontWeight: 'bold', color: '#1e293b', textAlign: 'right', display: 'block' }}>{val.toFixed(2)}%</span>;
        };
        enhancedCol.cellStyle = { textAlign: 'right' };
      }

      // Conversion rate formatter
      if (key === 'Conversion_Rate' || fieldLower.includes('conversion') || headerLower.includes('conversion')) {
        enhancedCol.cellRenderer = (params) => {
          const val = parseFloat(params.value);
          if (isNaN(val)) return '—';
          let color = '#1e293b';
          if (val >= 25) color = 'green';
          else if (val >= 10) color = '#374151';
          else color = 'red';
          return <span style={{ fontWeight: 'bold', color, textAlign: 'right', display: 'block' }}>{val.toFixed(2)}%</span>;
        };
        enhancedCol.cellStyle = { textAlign: 'right' };
      }

      // Money value formatter - for Total Sale Value, Current Stock Value, etc.
      if (
        fieldLower.includes('sale value') || 
        fieldLower.includes('stock value') ||
        fieldLower.includes('price') ||
        fieldLower.includes('revenue') ||
        fieldLower.includes('amount') ||
        headerLower.includes('sale value') || 
        headerLower.includes('stock value') ||
        headerLower.includes('value') ||
        // Match specific column names from your image
        key === 'Total_Sale_Value' ||
        key === 'Current_Stock_Value'
      ) {
        enhancedCol.cellRenderer = (params) => {
          const val = params.value;
          if (val === null || val === undefined || isNaN(val)) return '—';
          return <span style={{ fontWeight: '500', color: '#0f172a', textAlign: 'right', display: 'block' }}>
            {formatIndianCurrency(val)}
          </span>;
        };
        enhancedCol.cellStyle = { textAlign: 'right' };
      }

      // General number formatter for quantities, stock, etc.
      if (
        (
          fieldLower.includes('stock') ||
          fieldLower.includes('quantity') ||
          fieldLower.includes('number') ||
          fieldLower.includes('viewed') ||
          fieldLower.includes('cart') ||
          fieldLower.includes('sold') ||
          headerLower.includes('stock') ||
          headerLower.includes('quantity') ||
          headerLower.includes('sold') ||
          // Match specific column names from your image
          key === 'Total_Current_Stock' ||
          key === 'Total_Quantity_Sold'
        ) &&
        typeof modalRowData?.[0]?.[key] === 'number'
      ) {
        enhancedCol.valueFormatter = (params) => {
          const val = parseInt(params.value);
          return isNaN(val) ? '—' : val.toLocaleString('en-IN');
        };
        enhancedCol.cellStyle = { textAlign: 'right', color: '#0f172a', fontWeight: 500 };
      }

      return enhancedCol;
    });

    // Enhanced Target column with combined data
    const hasTargetData = modalRowData[0]?.Target_Column && modalRowData[0]?.Target_Key && modalRowData[0]?.Target_Value !== undefined;

    if (hasTargetData) {
      const targetCol = {
        headerName: 'Target',
        field: 'Target',
        pinned: 'left',
        minWidth: 220,
        cellRenderer: (params) => {
          const row = params.data;
          const label = row?.Target_Column?.replace(/_/g, ' ') || '';
          const value = row?.Target_Key || '';
          const targetValue = formatIndianCurrency(row?.Target_Value);

          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              height: '100%',
              padding: '6px 10px',
            }}>
              <div style={{ fontSize: '14px', color: '#475569' }}>
                <span style={{ fontWeight: 500 }}>{label}</span>{' '}
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{value}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', marginRight: '4px' }}>🎯</span>
                <span style={{ fontWeight: 600 }}>Target:</span>&nbsp;
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{targetValue}</span>
              </div>
            </div>
          );
        }
      };

      // Prepend to the start of the column list
      columns.unshift(targetCol);
    }

    return columns;
  }, [modalColumnDefs, modalRowData]);

  if (!showModal) return null;

  const groupingOptions = [
    { value: business === 'BEE7W5ND34XQZRM' ? 'Product_Type' : 'Category', label: business === 'BEE7W5ND34XQZRM' ? 'Product Type' : 'Category' },
    { value: 'Item_Type', label: 'Item Type' },
    { value: 'Item_Name', label: 'Item Name' },
    { value: 'Target_Column', label: 'Target Grouping' }
  ];

  const handleCheckboxChange = (field) => {
    setSelectedGroupings(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleApplyGrouping = () => {
    handleGroupByChange(selectedGroupings.join(','));
  };

  const handleClearGrouping = () => {
    setSelectedGroupings([]);
    handleGroupByChange('');
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={`${reportStyles.container} ${modalStyles.modalContent}`}>
        <div className={modalStyles.modalHeader}>
          <div className={modalStyles.modalTitleSection}>
            <h3 className={modalStyles.modalTitle}>{modalTitle}</h3>
            <div className={modalStyles.modalDateInfo}>
              {currentRowDate.startDate}
              {currentRowDate.startDate !== currentRowDate.endDate ? ` to ${currentRowDate.endDate}` : ''}
            </div>
          </div>
          <button onClick={closeModal} className={modalStyles.closeButton}>×</button>
        </div>

        <div className={modalStyles.modalControls}>
          <div className={modalStyles.groupBySection}>
            <label className={formStyles.label}>Group By:</label>
            <div className={modalStyles.checkboxContainer}>
              {groupingOptions.map(option => (
                <label
                  key={option.value}
                  className={modalStyles.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroupings.includes(option.value)}
                    onChange={() => handleCheckboxChange(option.value)}
                    className={modalStyles.checkboxInput}
                  />
                  {option.label}
                </label>
              ))}

              <div className={modalStyles.buttonGroup}>
                <button onClick={handleApplyGrouping} className={`${reportStyles.button} ${reportStyles.primary}`}>
                  <FunnelIcon className={reportStyles.icon} />
                  Apply Grouping
                </button>

                <button onClick={handleClearGrouping} className={reportStyles.button}>
                  <TrashIcon className={reportStyles.icon} />
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className={modalStyles.actionButtons}>
            {showModalExport && (
              <>
                <button onClick={exportModalDataToCSV} className={reportStyles.button}>
                  <ArrowDownTrayIcon className={reportStyles.icon} />
                  Export CSV
                </button>
                <button
                  onClick={() => exportToGoogleSheet(business, modalRowData)}
                  disabled={!modalRowData || modalRowData.length === 0 || !business}
                  className={`${reportStyles.button} ${(!modalRowData || modalRowData.length === 0 || !business) ? reportStyles.disabled : ''}`}
                >
                  📤 Export to Google Sheet
                </button>
              </>
            )}
          </div>
        </div>

        {modalLoading ? (
          <div className={modalStyles.loadingIndicator}>
            <div className={reportStyles.spinner}></div>
            Loading details...
          </div>
        ) : (
          <div className={modalStyles.gridContainer}>
            <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
              <AgGridReact
                ref={modalGridRef}
                rowData={modalRowData}
                columnDefs={enhancedModalColumnDefs}
                rowHeight={40}
                rowStyle={{ boxShadow: 'inset 0 -1px 0 #e2e8f0' }}
                defaultColDef={{
                  flex: 1,
                  sortable: true,
                  filter: true,
                  resizable: true
                }}
                onCellClicked={(params) => {
                  if (sizeColumns.includes(params.colDef.field) && params.value) {
                    onCellClicked(params);
                  }
                }}
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit();
                }}
                onFirstDataRendered={(params) => {
                  params.api.sizeColumnsToFit();
                }}
                pagination={true}
                paginationPageSize={15}
              />
            </div>
          </div>
        )}

        <div className={modalStyles.modalFooter}>
          <button onClick={closeModal} className={modalStyles.closeButtonFooter}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;