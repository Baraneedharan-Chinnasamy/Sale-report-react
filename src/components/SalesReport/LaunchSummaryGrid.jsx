import React, { useMemo, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LaunchSummaryGrid = ({ data = [], selectedColumns = [] }) => {
  const [above120Count, setAbove120Count] = useState(0);
  const [below120Count, setBelow120Count] = useState(0);
  const [currentStockPositive, setCurrentStockPositive] = useState(0);
  const [currentStockZero, setCurrentStockZero] = useState(0);

  // Update counts for the items based on conditions
  useEffect(() => {
    let above120 = 0;
    let below120 = 0;
    let positiveStock = 0;
    let zeroStock = 0;

    data.forEach(item => {
      const daysToSellout = item.days_since_launch + (item.Projected_Days_to_Sellout || 0);
      if (daysToSellout > 120) above120++;
      else below120++;

      if (item.Current_Stock > 0) positiveStock++;
      else if (item.Current_Stock <= 0) zeroStock++;
    });

    setAbove120Count(above120);
    setBelow120Count(below120);
    setCurrentStockPositive(positiveStock);
    setCurrentStockZero(zeroStock);
  }, [data]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .cohesive-grid .ag-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 10 !important;
        background: white !important;
        border-bottom: 2px solid #e5e7eb !important;
      }
      .cohesive-grid .ag-header-row {
        background: white !important;
      }
      .cohesive-grid .ag-header-cell {
        background: white !important;
        border-right: 1px solid #e5e7eb !important;
      }
      .numeric-cell {
        text-align: right !important;
        font-variant-numeric: tabular-nums !important;
      }
      .monetary-value {
        font-weight: 500 !important;
        color: #059669 !important;
      }
      .ag-tooltip-custom {
        background: #374151 !important;
        color: white !important;
        border-radius: 4px !important;
        padding: 8px !important;
        font-size: 12px !important;
      }
      .cohesive-grid {
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        position: relative !important;
        margin-top: 20px !important;
      }
      .cohesive-grid .ag-root-wrapper {
        border: none !important;
        height: 100% !important;
      }
      .cohesive-grid .ag-center-cols-container {
        overflow-y: auto !important;
      }
      .cohesive-grid .ag-body-viewport {
        overflow-y: auto !important;
        max-height: calc(100% - 45px) !important;
      }
      .days-sellout-high {
        background-color: #dc2626 !important;
        color: white !important;
        font-weight: 500 !important;
      }
      .days-sellout-high .ag-cell-value {
        background-color: #dc2626 !important;
        color: white !important;
        font-weight: 500 !important;
        padding: 4px 8px !important;
        border-radius: 3px !important;
      }
      .days-sellout-low {
        background-color: #16a34a !important;
        color: white !important;
        font-weight: 500 !important;
      }
      .days-sellout-low .ag-cell-value {
        background-color: #16a34a !important;
        color: white !important;
        font-weight: 500 !important;
        padding: 4px 8px !important;
        border-radius: 3px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const columnDefs = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const sample = data[0];
    
    // Debug: Log the first few rows of data
    console.log('Grid data sample:', data.slice(0, 3));
    console.log('Sample keys:', Object.keys(sample));

    // Add a computed column: "Days to Sellout"
    const computedColumn = {
      headerName: "Days to Sellout",
      field: "Days to Sellout",
      valueGetter: (params) => {
        // Calculate Days to Sellout
        const daysToSellout = params.data.days_since_launch + (params.data.Projected_Days_to_Sellout || 0);
        return daysToSellout;
      },
      cellClass: (params) => {
        // Check the value of Days to Sellout and apply CSS class
        const daysToSellout = params.data.days_since_launch + (params.data.Projected_Days_to_Sellout || 0);
        console.log('CellClass called:', {
          row: params.rowIndex,
          days_since_launch: params.data.days_since_launch,
          projected_days: params.data.Projected_Days_to_Sellout,
          calculated_days: daysToSellout,
          condition: daysToSellout > 120 ? 'RED (>120)' : 'GREEN (<=120)'
        });
        
        if (daysToSellout > 120) {
          return 'days-sellout-high numeric-cell'; // Red for > 120
        } else {
          return 'days-sellout-low numeric-cell'; // Green for <= 120
        }
      },
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 150,
    };

    // Add columns dynamically based on data and selectedColumns
    return [
      computedColumn, // Insert the computed column at the start
      ...(selectedColumns.length > 0 ? selectedColumns : Object.keys(sample)).map((key) => {
        const fieldLower = key.toLowerCase();
        const isNumeric = ['quantity', 'value', 'price', 'total', 'count', 'amount', 'stock'].some(k => fieldLower.includes(k));
        const isPercentage = ['percentage', 'rate', 'growth'].some(k => fieldLower.includes(k));
        const isDate = fieldLower.includes('date') || fieldLower.endsWith('_date');
        
        return {
          headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
          wrapText: false,
          autoHeight: false,
          tooltipField: key,
          tooltipComponentParams: { class: 'ag-tooltip-custom' },
          minWidth: fieldLower.includes('name') || fieldLower.includes('size') || fieldLower.includes('colour') ? 200 : 100,
          valueFormatter: (params) => {
            const val = params.value;
            if (val === null || val === undefined || val === '' || val === 'None') return '—';
            if (isDate) {
              const d = new Date(val);
              return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-GB');
            }
            if (isPercentage) {
              const f = parseFloat(val);
              return isFinite(f) ? `${f.toFixed(2)}%` : '—';
            }
            if (isNumeric) {
              const f = parseFloat(val);
              return isFinite(f) ? f.toLocaleString() : '—';
            }
            return val;
          },
          cellClass: (params) => {
            const classes = [];
            if (isNumeric || isPercentage) classes.push('numeric-cell');
            if (fieldLower.includes('value') || fieldLower.includes('price')) classes.push('monetary-value');
            return classes.join(' ');
          }
        };
      })
    ];
  }, [data, selectedColumns]);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressMenu: false,
    menuTabs: ['filterMenuTab', 'generalMenuTab'],
  }), []);

  // Dynamically calculate grid height
  const rowHeight = 38;
  const headerHeight = 45;
  const extraPadding = 16;
  const maxHeight = 600;

  const totalHeight = Math.min(
    headerHeight + data.length * rowHeight + extraPadding,
    maxHeight
  );

  return (
    <div>
      <div className="grid-summary" style={{ marginBottom: '15px', fontSize: '14px' }}>
        <span>Above 120 Days: <strong style={{ color: '#dc2626' }}>{above120Count}</strong></span> | 
        <span> Below or equal to 120 Days: <strong style={{ color: '#16a34a' }}>{below120Count}</strong></span> | 
        <span> Items with Positive Stock: <strong>{currentStockPositive}</strong></span> | 
        <span> Items with Zero/Negative Stock: <strong>{currentStockZero}</strong></span>
      </div>

      <div 
        className="ag-theme-alpine cohesive-grid" 
        style={{ 
          width: '100%', 
          height: `${totalHeight}px`,
          minHeight: '150px',
          overflow: 'hidden'
        }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          domLayout="normal"
          tooltipShowDelay={200}
          animateRows={true}
          enableRangeSelection={true}
          suppressRowClickSelection={true}
          rowSelection="multiple"
          suppressCellFocus={true}
          enableCellTextSelection={true}
          suppressHorizontalScroll={false}
          suppressScrollOnNewData={true}
          rowBuffer={10}
          suppressAnimationFrame={false}
          key={JSON.stringify(columnDefs.map(c => c.field))}
          loadingOverlayComponent={() => (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Loading data...
            </div>
          )}
          noRowsOverlayComponent={() => (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              No data available
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default LaunchSummaryGrid;