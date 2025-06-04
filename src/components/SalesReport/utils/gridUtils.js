// File: components/SalesReport/utils/gridUtils.js

export const createStyledSizeGrid = (data, title) => {
    if (data && typeof data === 'object') {
      const sizeData = Object.entries(data).map(([size, qty]) => ({
        Size: size,
        Quantity: qty,
      }));
  
      return {
        rowData: sizeData,
        columnDefs: [
          {
            headerName: 'Size',
            field: 'Size',
            flex: 1,
            minWidth: 150,
            cellStyle: { textAlign: 'center', color: 'black', fontWeight: 'bold' },
          },
          {
            headerName: 'Quantity',
            field: 'Quantity',
            flex: 1,
            minWidth: 150,
            cellStyle: { textAlign: 'center', color: 'black', fontWeight: 'bold' },
          },
        ],
        title,
      };
    }
    return null;
  };
  