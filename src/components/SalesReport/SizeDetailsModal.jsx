import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const SizeDetailsModal = ({
  showNestedModal,
  closeNestedModal,
  nestedModalTitle,
  nestedModalGridRef,
  nestedModalRowData,
  nestedModalColumnDefs
}) => {
  const getRowClass = (params) => (params.rowIndex % 2 === 0 ? '' : 'stripe-row');

  if (!showNestedModal) return null;

  return (
    <div style={styles.nestedModalOverlay}>
      <div style={styles.nestedModalBox}>
        <div style={styles.nestedModalHeader}>
          <h3 style={styles.nestedModalTitle}>{nestedModalTitle}</h3>
          <button onClick={closeNestedModal} style={styles.nestedModalCloseBtn}>×</button>
        </div>

        <div style={styles.nestedGridContainer} className="ag-theme-alpine">
          <AgGridReact
            ref={nestedModalGridRef}
            modules={[ClientSideRowModelModule]}
            rowData={nestedModalRowData}
            columnDefs={nestedModalColumnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              wrapHeaderText: true,
              autoHeaderHeight: true,
              minWidth: 100,
            }}
            getRowClass={getRowClass}
            headerHeight={50}
            rowHeight={50}
            domLayout="autoHeight"
            suppressMovableColumns
          />
        </div>

        <div style={styles.nestedModalFooter}>
          <button style={styles.nestedModalButton} onClick={closeNestedModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  nestedModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  nestedModalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    animation: 'modalFadeIn 0.3s ease-out'
  },
  nestedModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  nestedModalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.5px'
  },
  nestedModalCloseBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  },
  nestedGridContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px',
    minHeight: '300px'
  },
  nestedModalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 24px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
  nestedModalButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default SizeDetailsModal;

// ✅ UPDATED: now handles Quantity and Item_Name_Count
export const prepareSizeDetails = (rawData, titleLabel) => {
  if (!rawData || typeof rawData !== 'object') return null;

  const rowData = Object.entries(rawData).map(([key, value]) => ({
    Label: key,
    Quantity: value?.Quantity ?? 0,
    Item_Name_Count: value?.Item_Name_Count ?? 0
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
      cellStyle: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#1e293b',
      },
      valueFormatter: (params) =>
        isNaN(params.value) ? '—' : params.value.toLocaleString('en-IN'),
    },
    {
      headerName: 'Item Name Count',
      field: 'Item_Name_Count',
      flex: 1,
      type: 'numericColumn',
      cellStyle: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#1e293b',
      },
      valueFormatter: (params) =>
        isNaN(params.value) ? '—' : params.value.toLocaleString('en-IN'),
    },
  ];

  return {
    rowData,
    columnDefs,
    title: titleLabel,
  };
};
