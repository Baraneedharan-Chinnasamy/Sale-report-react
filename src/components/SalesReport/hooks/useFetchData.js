import { useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham",
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const useFetchData = ({
  aggregation,
  startDate,
  endDate,
  getFilterParams,
  setLoading,
  setRowData,
  setColumnDefs,
  sizeColumns,
  setSummary,
  compareStartDate,
  compareEndDate
}) => {
  // Fetch business name from localStorage
  const businessName = localStorage.getItem('selectedBusiness');
  
  // Map business name to business code using BUSINESS_CODE_MAP
  const businessCode = Object.keys(BUSINESS_CODE_MAP).find(code => BUSINESS_CODE_MAP[code] === businessName);

  const isValidDate = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
  };

  const fetchData = useCallback(async () => {
    // Validate required fields
    const isCompare = aggregation === 'compare';
    console.log('DEBUG: Aggregation:', aggregation);
    console.log('DEBUG: Start:', startDate, 'isValid:', isValidDate(startDate));
    console.log('DEBUG: End:', endDate, 'isValid:', isValidDate(endDate));
    console.log('DEBUG: Business:', businessCode);  // businessCode is now the code, not the name
    console.log('DEBUG: Compare Start:', compareStartDate, 'Compare End:', compareEndDate);

    if (
      !aggregation || !startDate || !endDate || !businessCode ||
      !isValidDate(startDate) || !isValidDate(endDate) ||
      (isCompare && (!compareStartDate || !compareEndDate || !isValidDate(compareStartDate) || !isValidDate(compareEndDate)))
    ) {
      alert('Please select valid Aggregation, Start Date, End Date, and Business ID.');
      return;
    }

    setLoading(true);
    try {
      const filterParams = getFilterParams?.();

      const requestParams = {
        Start_Date: startDate,
        End_Date: endDate,
        business: businessCode,  // Using businessCode here
        aggregation,
      };

      if (filterParams) {
        requestParams.item_filter = filterParams;
      }

      // Add comparison if applicable
      if (isCompare) {
        requestParams.compare_with = JSON.stringify({
          start_date: compareStartDate,
          end_date: compareEndDate,
        });
      }

      const response = await axios.get(`${API_URL}/api/Sale-report`, {
        params: requestParams, withCredentials: true, 
      });

      const { details: report, summary, comparison_details } = response.data?.data ?? {};

      // Merge both current and comparison rows
      let combinedReport = Array.isArray(report) ? [...report] : [];

      if (Array.isArray(comparison_details)) {
        combinedReport = combinedReport.concat(comparison_details);
      }

      if (!Array.isArray(combinedReport)) {
        console.error('API response does not contain valid detail arrays:', response.data);
        alert('Unexpected data format from server. Please check console.');
        setLoading(false);
        return;
      }

      setSummary?.(summary); // Keep original summary for calculations

      const parsedData = combinedReport.map((item) => ({
        ...item,
        Date: item.Date,
      }));

      setRowData(parsedData);

      if (parsedData.length > 0) {
        const keys = Object.keys(parsedData[0]);
        const columns = keys
          .filter(key => key !== 'target_wise')
          .map((key) => ({
            headerName: key.replaceAll('_', ' '),
            field: key,
            pinned: key === 'Date' ? 'left' : undefined,
            minWidth: 150,
            valueFormatter: sizeColumns?.includes(key)
              ? (params) => {
                  if (!params.value) return '-';
                  if (typeof params.value === 'object') return 'View';
                  return params.value;
                }
              : undefined,
            cellStyle: sizeColumns?.includes(key)
              ? (params) => ({
                  color: 'white',
                  backgroundColor: params.value ? '#6a11cb' : '',
                  borderRadius: '5px',
                  textAlign: 'center',
                  cursor: params.value ? 'pointer' : 'default',
                  fontWeight: 'bold',
                })
              : undefined,
            sortable: true,
            filter: true,
            resizable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
          }));

        columns.unshift({
          headerName: '',
          field: 'detailPanel',
          cellRenderer: 'agGroupCellRenderer',
          width: 60,
          pinned: 'left',
          suppressMenu: true,
          suppressSorting: true,
        });

        setColumnDefs(columns);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Something went wrong while fetching the data.');
    } finally {
      setLoading(false);
    }
  }, [
    aggregation,
    startDate,
    endDate,
    businessCode,  // We are now using businessCode derived from localStorage
    getFilterParams,
    setLoading,
    setRowData,
    setColumnDefs,
    sizeColumns,
    setSummary,
    compareStartDate,
    compareEndDate
  ]);

  return { fetchData };
};

export default useFetchData;
