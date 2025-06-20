import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham",
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const useLaunchSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLaunchSummary = async ({ 
    days, 
    groupBy, 
    itemFilter = {}, 
    variationColumns = [], 
    launchDateFilter = null,
    calculate_first_period = true,
    calculate_second_period = true
  }) => {
    console.log('fetchLaunchSummary called!');
    setLoading(true);
    setError(null);

    try {
      // Get business code from localStorage
      const business = localStorage.getItem('selectedBusiness');
      // Map name to code
      const businessCode = Object.keys(BUSINESS_CODE_MAP).find(
        code => BUSINESS_CODE_MAP[code] === business
      );
      if (!businessCode) throw new Error(`Invalid business name: ${business}`);
      const businessName = BUSINESS_CODE_MAP[businessCode];

      // Validate required parameters
      if (!business || !groupBy || !days) {
        throw new Error('Missing required parameters: business, groupBy, or days');
      }

      const payload = {
        days: Number(days),
        group_by: groupBy,
        business: businessCode, // Use the mapped name for the payload
        item_filter: {},
        variation_columns: variationColumns,
        launch_date_filter: launchDateFilter,
        calculate_first_period,
        calculate_second_period
      };

      console.log('Hook payload being sent:', payload);
      console.log('API URL:', `${API_URL}/api/launch-summary?business=${businessCode}`);

      const response = await axios.post(`${API_URL}/api/launch-summary?business=${businessCode}`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response.data);
      setData(response.data || []);
    } catch (err) {
      console.error('Launch Summary Fetch Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch launch summary';
      setError(errorMessage);
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchLaunchSummary };
};

export default useLaunchSummary;