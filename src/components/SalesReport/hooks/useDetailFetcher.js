import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useDetailFetcher = ({ business, aggregation, getFilterParams,startDate, endDate}) => {
  const [modalRowData, setModalRowData] = useState([]);
  const [modalColumnDefs, setModalColumnDefs] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalExport, setShowModalExport] = useState(false);
  const [currentStartDate, setCurrentStartDate] = useState('');
  const [currentEndDate, setCurrentEndDate] = useState('');
  const [currentGroupByField, setCurrentGroupByField] = useState('');
  const [nestedModalRowData, setNestedModalRowData] = useState([]);
  const [nestedModalColumnDefs, setNestedModalColumnDefs] = useState([]);
  const [nestedModalTitle, setNestedModalTitle] = useState('');
  const [showNestedModal, setShowNestedModal] = useState(false);

  // Dynamic size/age columns
  const isAgeBusiness = business === 'BEE7W5ND34XQZRM';
  const sizeColumns = isAgeBusiness
    ? ['Age_Sold_Quantities', 'Current_Stock_By_Age']
    : ['Size_Sold_Quantities', 'Current_Stock_By_Size'];

  const closeModal = () => setShowModal(false);
  const closeNestedModal = () => setShowNestedModal(false);

  const fetchDetailsData = useCallback(async (startDate, endDate, selectedGroup = 'Item_Type') => {
    setModalLoading(true);
    // Store current parameters for potential use by fetchFullData
    setCurrentStartDate(startDate);
    setCurrentEndDate(endDate);
    setCurrentGroupByField(selectedGroup);
    
    try {
      const filterParams = getFilterParams();
      
      // Remove the override and use the actual selectedGroup parameter
      const groupByField = selectedGroup;

      const response = await axios.get(`${API_URL}/api/Sale-Report/Detiled`, {
        params: {
          Start_Date: startDate,
          End_Date: endDate,
          business,
          aggregation,
          col: 'total',
          group_by: groupByField,
          item_filter: filterParams,
        }, withCredentials: true, 
      });

      const data = response.data.data;

      if (data && data.length > 0) {
        setModalRowData(data);
        const modalKeys = Object.keys(data[0]);

        setModalColumnDefs(
          modalKeys.map((key) => ({
            headerName: key.replaceAll('_', ' '),
            field: key,
            minWidth: 150,
            resizable: true,
            sortable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            cellRenderer: sizeColumns.includes(key)
              ? (params) => {
                  if (!params.value) return '-';
                  if (typeof params.value === 'object') return 'View';
                  return params.value;
                }
              : undefined,
            cellStyle: sizeColumns.includes(key)
              ? {
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }
              : undefined,
          }))
        );

        setShowModalExport(true);
      } else {
        setModalRowData([]);
        alert('No detailed data available for this date.');
      }
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      alert('Failed to fetch detailed data.');
    } finally {
      setModalLoading(false);
    }
  }, [business, aggregation, getFilterParams, sizeColumns]);

  // Updated fetchFullData function to use the same parameters as the outer grid
  const fetchFullData = useCallback(async (isFullData) => {
    if (!isFullData) {
      return; // If unchecked, do nothing extra
    }
    
    // Use the same parameters that were used in fetchDetailsData
    if (!currentStartDate || !currentEndDate) {
      alert('Please fetch detailed data first before requesting full data.');
      return;
    }
    
    setModalLoading(true);
    try {
      const filterParams = getFilterParams();
      
      const response = await axios.get(`${API_URL}/api/detiles`, {
        params: {
          Start_Date: startDate,
          End_Date: endDate,
          business,
          aggregation,
          col: 'total',
          group_by: currentGroupByField,
          item_filter: filterParams,
          full_data: true // Add a flag to indicate this is a full data request
        }, withCredentials: true, 
      });

      const data = response.data.data;
      
      if (data && data.length > 0) {
        setModalRowData(data);
        const modalKeys = Object.keys(data[0]);
        
        setModalColumnDefs(
          modalKeys.map((key) => ({
            headerName: key.replaceAll('_', ' '),
            field: key,
            minWidth: 150,
            resizable: true,
            sortable: true,
            wrapHeaderText: true,
            zIndex: 1100,
            autoHeaderHeight: true,
            cellRenderer: sizeColumns.includes(key)
              ? (params) => {
                  if (!params.value) return '-';
                  if (typeof params.value === 'object') return 'View';
                  return params.value;
                }
              : undefined,
            cellStyle: sizeColumns.includes(key)
              ? {
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }
              : undefined,
          }))
        );
      } else {
        alert('No full data available with current filters.');
      }
    } catch (error) {
      console.error('Error fetching full data:', error);
      alert('Failed to fetch full data.');
    } finally {
      setModalLoading(false);
    }
  }, [business, aggregation, getFilterParams, sizeColumns, currentStartDate, currentEndDate, currentGroupByField]);

  return {
    fetchDetailsData,
    fetchFullData,
    modalRowData,
    modalColumnDefs,
    setModalColumnDefs,
    modalTitle,
    setModalTitle,
    modalLoading,
    showModal,
    setShowModal,
    showModalExport,
    setShowModalExport,
    closeModal,
    closeNestedModal,
    business,
    showNestedModal,
    setShowNestedModal,
    nestedModalRowData,
    setNestedModalRowData,
    nestedModalColumnDefs,
    setNestedModalColumnDefs,
    nestedModalTitle,
    setNestedModalTitle,
    currentStartDate,
    currentEndDate,
    currentGroupByField,
  };
};

export default useDetailFetcher;