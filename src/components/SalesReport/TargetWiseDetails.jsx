  import React, { useMemo } from 'react';
  import { AgGridReact } from 'ag-grid-react';
  import ViewButtonRenderer from './ViewButtonRenderer'; // Adjust path

  // Generate Column Definitions
  const generateColumnDefs = (data, onCellClicked, sizeColumns = []) => {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]).filter(key => 
      !["Target_Column", "Target_Key", "Target_Value"].includes(key)
    );

    const columnDefs = [];

    // Add custom Target column first (pinned left)
    columnDefs.push({
      headerName: "Target",
      field: "Target",
      pinned: 'left',
      minWidth: 200,
      cellRenderer: (params) => {
    const row = params.data;
    const label = row?.Target_Column?.replace(/_/g, ' ') || '';
    const value = row?.Target_Key || '';
    const targetValue = row?.Target_Value?.toLocaleString();

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',     
        alignItems: 'flex-start',         // ⭐️ left-align everything
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
  ,
      cellStyle: { fontWeight: 'bold', background: '#f9fafb' }
    });

    // Dynamically add the rest
    keys.forEach((key) => {
      const fieldLower = key.toLowerCase();
      const isPercentage = fieldLower.includes('percentage') || fieldLower.includes('rate');
      const isNumeric = fieldLower.includes('value') || fieldLower.includes('stock') || fieldLower.includes('quantity') || fieldLower.includes('total');

      const def = {
        headerName: key.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' '),
        field: key,
        sortable: true,
        filter: true,
        resizable: true,
        width: key.length > 20 ? 250 : key.length < 10 ? 150 : 200,
        cellStyle: { textAlign: isNumeric ? 'right' : 'left' },
      };

      // % Coloring
      // % Coloring with exceptions
  if (isPercentage) {
    const isPlain = ['conversion_rate', 'sell_through_rate'].includes(fieldLower);

    def.cellRenderer = (params) => {
      const val = parseFloat(params.value);
      if (isNaN(val)) return '—';

      const formatted = `${Math.abs(val).toFixed(2)}%`;

      // If it's Conversion Rate or Sell Through Rate — no color/arrow
      if (isPlain) {
        return (
          <span style={{ fontWeight: 500, color: '#0f172a' }}>
            {formatted}
          </span>
        );
      }

      const isPositive = val >= 0;
      const arrow = isPositive ? '▲' : '▼';
      const color = isPositive ? 'green' : 'red';

      return (
        <span style={{ fontWeight: 'bold', color }}>
          {arrow} {formatted}
        </span>
      );
    };
  }


      // Currency formatting
      if (fieldLower.includes("value") && !isPercentage) {
        def.valueFormatter = (params) => {
          const val = parseFloat(params.value);
          return isNaN(val) ? '—' : `₹${parseInt(val).toLocaleString()}`;
        };
      }

      // Number formatting
      if (isNumeric && !isPercentage && !fieldLower.includes("value")) {
        def.valueFormatter = (params) => {
          const val = parseInt(params.value);
          return isNaN(val) ? '—' : val.toLocaleString();
        };
      }

      // View button
      if (sizeColumns.includes(key)) {
        def.cellRenderer = ViewButtonRenderer;
        def.cellRendererParams = { onClick: onCellClicked };
        def.cellStyle = {
          color: 'white',
          backgroundColor: '#6a11cb',
          borderRadius: '5px',
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          padding: '4px',
        };
      }

      columnDefs.push(def);
    });

    return columnDefs;
  };

  const TargetWiseDetails = ({ targetWise, onCellClicked, sizeColumns = [] }) => {
    const rowData = useMemo(() => Array.isArray(targetWise) ? targetWise : [], [targetWise]);
    const columnDefs = useMemo(() => generateColumnDefs(rowData, onCellClicked, sizeColumns), [rowData, onCellClicked, sizeColumns]);

    return (
      <div className="p-4 w-full">
        <div className="ag-theme-alpine" style={{ height: '300px', padding: '10px' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            headerHeight={60}
            rowHeight={50}
            onCellClicked={(params) => {
              if (sizeColumns.includes(params.colDef.field) && params.value) {
                onCellClicked(params);
              }
            }}
          />
        </div>
      </div>
    );
  };

  export default TargetWiseDetails;
