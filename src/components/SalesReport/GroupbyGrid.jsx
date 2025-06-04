import React, { useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const GroupbyGrid = ({ data = [], onCellClicked = () => {}, sizeColumns = [] ,selectedColumns = [] }) => {
  useEffect(() => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const columnDefs = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sample = data[0];
    return selectedColumns.map((key) => {
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
        }
      };
    });
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

  return (
    <div className="ag-theme-alpine cohesive-grid" style={{ width: '100%' }}>
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        rowHeight={38} 
        onCellClicked={onCellClicked}
        domLayout="autoHeight"
        tooltipShowDelay={200}
        animateRows={true}
        enableRangeSelection={true}
        suppressRowClickSelection={true}
        rowSelection="multiple"
        suppressCellFocus={true}
        enableCellTextSelection={true}
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
  );
};

export default GroupbyGrid;
