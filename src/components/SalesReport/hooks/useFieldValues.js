import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useFieldValues = (fieldName, business, itemFilter = {}, search = "", offset = 0, limit = 100) => {
  const [fieldValues, setFieldValues] = useState({
    values: [],
    total: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFieldValues = async () => {
      if (!fieldName || !business) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/filter/field-values`, {
          params: {
            field_name: fieldName,
            business,
            search,
            item_filter: itemFilter,
            offset,
            limit,
          },
          withCredentials: true,
        });

        if (response?.data) {
          setFieldValues({
            values: response.data.values,
            total: response.data.total,
            hasMore: response.data.has_more,
          });
        }
      } catch (err) {
        console.error('Error fetching field values:', err);
        setError('An error occurred while fetching the field values.');
      } finally {
        setLoading(false);
      }
    };

    fetchFieldValues();
  }, [fieldName, business, itemFilter, search, offset, limit]);

  return { fieldValues, loading, error };
};

export default useFieldValues;
