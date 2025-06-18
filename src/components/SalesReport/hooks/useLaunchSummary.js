import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useLaunchSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLaunchSummary = async ({ 
    days, 
    groupBy, 
    business, 
    itemFilter = {}, 
    variationColumns = [], 
    launchDateFilter = null,
    calculate_first_period = true,  // NEW - default to true
    calculate_second_period = true  // NEW - default to true
  }) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        days: Number(days), // ensure it's a number
        group_by: groupBy,
        business,
        item_filter: itemFilter,
        variation_columns: variationColumns,
        launch_date_filter: launchDateFilter,
        calculate_first_period,   // NEW
        calculate_second_period   // NEW
      };

      console.log('Hook payload being sent:', payload); // For debugging

      const response = await axios.post(`${API_URL}/api/launch-summary?business=${business}`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setData(response.data || []);
    } catch (err) {
      console.error('Launch Summary Fetch Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch launch summary');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchLaunchSummary };
};

export default useLaunchSummary;