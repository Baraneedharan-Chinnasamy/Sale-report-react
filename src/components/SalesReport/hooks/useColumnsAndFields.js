import { useCallback, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useColumnsAndFields = (business) => {
  const [loading, setLoading] = useState(false);
  const [columnNames, setColumnNames] = useState([]);
  const [aggColumns, setAggColumns] = useState([]); // ✅ New state
  const [fieldNames, setFieldNames] = useState([]);
  const [error, setError] = useState(null);

  const fetchColumnsAndFields = useCallback(async () => {
    if (!business) {
      console.warn('Business parameter is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching columns and fields for business: ${business}`);

      const response = await axios.get(`${API_URL}/api/get_columns_and_fields`, {
        params: { business },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        const {
          groupby: { columns = [], agg = [] } = {},
          field_names = []
        } = response.data;

        setColumnNames(columns);
        setAggColumns(agg); // ✅ Set aggregation columns
        setFieldNames(field_names);

        console.log('✅ Columns and fields fetched successfully');
        console.log('Column names:', columns);
        console.log('Aggregation columns:', agg);
        console.log('Field names:', field_names);

        return {
          columnNames: columns,
          aggColumns: agg,
          fieldNames: field_names
        };
      }
    } catch (error) {
      console.error('Error fetching columns and fields:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
      setError(errorMessage);

      // Reset data on error
      setColumnNames([]);
      setAggColumns([]);
      setFieldNames([]);

      return {
        columnNames: [],
        aggColumns: [],
        fieldNames: []
      };
    } finally {
      setLoading(false);
    }
  }, [business]);

  const resetData = useCallback(() => {
    setColumnNames([]);
    setAggColumns([]);
    setFieldNames([]);
    setError(null);
  }, []);

  const refetch = useCallback(() => {
    return fetchColumnsAndFields();
  }, [fetchColumnsAndFields]);

  return {
    // State
    loading,
    columnNames,
    aggColumns, // ✅ New
    fieldNames,
    error,

    // Actions
    fetchColumnsAndFields,
    resetData,
    refetch,

    // Computed
    hasData: columnNames.length > 0 || fieldNames.length > 0,
    isEmpty: columnNames.length === 0 && fieldNames.length === 0
  };
};

export default useColumnsAndFields;
