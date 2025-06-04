import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import ViewButtonRenderer from './ViewButtonRenderer';
import TargetWiseDetails from './TargetWiseDetails';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule]);

// Utility to generate dynamic columns
const generateColumnDefs = (data, onCellClicked, sizeColumns = []) => {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0]).filter(key => key !== 'target_wise');

  return keys.map(key => {
    const fieldLower = key.toLowerCase();

    const isNumeric = fieldLower.includes('value') ||
                      fieldLower.includes('stock') ||
                      fieldLower.includes('quantity') ||
                      fieldLower.includes('total');

    const isPercentage = fieldLower.includes('growth') || 
                         fieldLower.includes('percentage') ||
                         fieldLower.includes('rate');

    const columnDef = {
      headerName: key.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
      field: key,
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: (params) => {
        // Handle button styling for sizeColumns
        if (sizeColumns.includes(key) && params.value) {
          return {
            color: 'white',
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            borderRadius: '5px',
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
            padding: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          };
        }

        // Default text alignment
        return isNumeric || isPercentage
          ? { textAlign: 'right' }
          : {};
      },
      width: key.length > 20 ? 250 : key.length < 10 ? 150 : 200,
    };

    // Custom renderer for Sale Growth Percentage
    if (key === "Sale_Growth_Percentage" || fieldLower.includes("growth")) {
      columnDef.cellRenderer = (params) => {
        const val = params.value;
        
        if (val === null || val === undefined || val === "N/A" || isNaN(val)) {
          return '—';
        }
        
        const value = parseFloat(val);
        const isPositive = value >= 0;
        const arrow = isPositive ? '▲' : '▼';
        const color = isPositive ? 'green' : 'red';
        
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {arrow} {Math.abs(value).toFixed(2)}%
          </span>
        );
      };
    }

    // Sell Through Rate with intuitive color thresholds
    if (key === "Sell_Through_Rate" || fieldLower.includes("sell_through")) {
    columnDef.cellRenderer = (params) => {
      const val = parseFloat(params.value);

      if (isNaN(val) || val === null || val === undefined) {
        return '—';
      }

      return (
        <span style={{
          fontWeight: 'bold',
          color: '#1e293b',  // consistent dark text
          textAlign: 'right',
          display: 'block'
        }}>
          {val.toFixed(2)}%
        </span>
      );
    };

    columnDef.cellStyle = {
      textAlign: 'right'
    };
  }


    // Conversion Rate with subtle neutral for mid-range
    if (key === 'Conversion_Rate' || fieldLower.includes('conversion')) {
      columnDef.cellRenderer = (params) => {
        const val = parseFloat(params.value);
        if (isNaN(val)) return '—';
        
        let color = '#1e293b'; // neutral
        if (val >= 25) color = 'green';
        else if (val >= 10) color = '#374151'; 
        else color = 'red';
        
        return (
          <span style={{
            fontWeight: 'bold',
            color,
            textAlign: 'right',
            display: 'block'
          }}>
            {val.toFixed(2)}%
          </span>
        );
      };
      
      columnDef.cellStyle = {
        textAlign: 'right',
      };
    }

    // Total Current Stock with comma formatting
    if (key === 'Total_Current_Stock' || fieldLower.includes('current_stock')) {
      columnDef.valueFormatter = (params) => {
        const val = parseInt(params.value);
        return isNaN(val) ? '—' : val.toLocaleString();  // adds commas
      };
      
      columnDef.cellStyle = {
        textAlign: 'right',
        fontWeight: '500',
        color: '#0f172a'  // slate-900 or dark neutral
      };
    }

    // All quantity fields comma-separated
    if (
      fieldLower.includes('stock') ||
      fieldLower.includes('quantity') ||
      fieldLower.includes('number') ||
      fieldLower.includes('viewed') ||
      fieldLower.includes('cart') ||
      fieldLower.includes('sold') &&
      typeof data[0][key] === 'number'
    ) {
      columnDef.valueFormatter = (params) => {
        const val = parseInt(params.value);
        return isNaN(val) ? '—' : val.toLocaleString();
      };
      
      columnDef.cellStyle = {
        textAlign: 'right',
        color: '#0f172a',     // dark neutral
        fontWeight: 500
      };
    }

// Pinned & formatted Date with extremely robust error handling
if (fieldLower === 'date') {
  columnDef.valueFormatter = (params) => {
    const val = params.value;
    if (!val) return '—';
    
    // Parse date function with multiple fallback methods
    const parseAndFormatDate = (dateStr) => {
      // Method 1: Try direct parsing
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch (e) {
        // Continue to next method if this fails
      }
      
      // Method 2: Try parsing YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        try {
          const parts = dateStr.split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
          const day = parseInt(parts[2], 10);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          }
        } catch (e) {
          // Continue to next method if this fails
        }
      }
      
      // Method 3: Try with regex to extract date parts from various formats
      const dateFormats = [
        /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
        /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/, // DD-MM-YYYY or DD/MM/YYYY
        /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/, // DD Month YYYY
      ];
      
      for (const regex of dateFormats) {
        const match = dateStr.match(regex);
        if (match) {
          try {
            let year, month, day;
            
            if (regex === dateFormats[0]) {
              // YYYY-MM-DD
              year = parseInt(match[1], 10);
              month = parseInt(match[2], 10) - 1;
              day = parseInt(match[3], 10);
            } else if (regex === dateFormats[1]) {
              // DD-MM-YYYY
              day = parseInt(match[1], 10);
              month = parseInt(match[2], 10) - 1;
              year = parseInt(match[3], 10);
            } else {
              // DD Month YYYY
              day = parseInt(match[1], 10);
              // Convert month name to number
              const monthNames = [
                'january', 'february', 'march', 'april', 'may', 'june', 
                'july', 'august', 'september', 'october', 'november', 'december',
                'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
              ];
              const monthLower = match[2].toLowerCase();
              let monthIndex = monthNames.indexOf(monthLower);
              if (monthIndex >= 12) monthIndex -= 12; // Adjust for abbreviated names
              month = monthIndex;
              year = parseInt(match[3], 10);
            }
            
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
            }
          } catch (e) {
            // Try next format if this fails
          }
        }
      }
      
      // If all parsing methods fail, return the original string
      return dateStr;
    };
    
    // Check if the value contains "to" indicating a date range
    if (typeof val === 'string' && val.includes('to')) {
      try {
        const [startDateStr, endDateStr] = val.split('to').map(d => d.trim());
        const startFormatted = parseAndFormatDate(startDateStr);
        const endFormatted = parseAndFormatDate(endDateStr);
        return `${startFormatted} to ${endFormatted}`;
      } catch (err) {
        // If any error in processing, return original string
        console.log("Date parsing error:", err);
        return val;
      }
    } else {
      // Handle single date
      return parseAndFormatDate(val);
    }
  };
  
  columnDef.pinned = 'left';
  columnDef.minWidth = 150;
  columnDef.cellStyle = {
    fontWeight: 'bold',
    color: '#1e293b',
  };
}

    // Format other value fields as currency
    if (fieldLower.includes('value') && !isPercentage) {
      columnDef.valueFormatter = (params) => {
        const val = params.value;
        return (val === null || val === undefined || isNaN(val)) ? '—' : `₹${parseInt(val).toLocaleString()}`;
      };
      
      columnDef.cellStyle = {
        textAlign: 'right',
        fontWeight: '500',
        color: '#0f172a'
      };
    }

    // Add view button renderer if it's a sizeColumn
    if (sizeColumns.includes(key)) {
      columnDef.cellRenderer = ViewButtonRenderer;
      columnDef.cellRendererParams = { onClick: onCellClicked };
    }

    return columnDef;
  });
};

const MainDataGrid = ({ gridRef, rowData, onCellClicked, sizeColumns = [] }) => {
  const columnDefs = useMemo(() => {
    if (!rowData || rowData.length === 0) return [];
    
    const baseColumns = generateColumnDefs(rowData, onCellClicked, sizeColumns);
    
    // Handle date column specially
    const dateColumnIndex = baseColumns.findIndex(col => col.field.toLowerCase() === 'date');
    if (dateColumnIndex !== -1) {
      const dateColumn = baseColumns.splice(dateColumnIndex, 1)[0];
      dateColumn.cellRenderer = 'agGroupCellRenderer';
      dateColumn.cellRendererParams = {
        suppressCount: true,
        innerRenderer: (params) => {
  const val = params.value;
  if (!val || typeof val !== 'string') return '—';

  const parseDate = (str) => {
    const parts = str.trim().split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(p => parseInt(p));
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }
    return str;
  };

  if (val.includes('to')) {
    const [start, end] = val.split('to').map(s => s.trim());
    const formattedStart = parseDate(start);
    const formattedEnd = parseDate(end);
    return `${formattedStart} to ${formattedEnd}`;
  } else {
    return parseDate(val);
  }
}

      };
      dateColumn.pinned = 'left';
      dateColumn.minWidth = 200;
      baseColumns.unshift(dateColumn);
    }
    
    return baseColumns;
  }, [rowData, onCellClicked, sizeColumns]);

  const masterDetailCellRenderer = (params) => {
    if (params.data?.target_wise) {
      return <TargetWiseDetails 
        targetWise={params.data.target_wise} 
        onCellClicked={onCellClicked}
        sizeColumns={sizeColumns}
      />;
    }
    return null;
  };

  const defaultColDef = {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 150,
    headerClass: 'grid-header-style',
  };

  return (
    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        masterDetail={true}
        detailCellRenderer={masterDetailCellRenderer}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        suppressColumnVirtualisation={true}
        suppressHorizontalScroll={false}
        alwaysShowHorizontalScroll={true}
        domLayout="normal"
        headerHeight={40}
        rowHeight={40}
        onCellClicked={onCellClicked}
        getRowStyle={(params) => {
        if (params.node.detail) {
          return {
            position: 'relative',
            zIndex: 100 + params.node.rowIndex,
            overflow: 'visible',
          };
        }
        return {};
      }}
      />
    </div>
  );
};

export default MainDataGrid;