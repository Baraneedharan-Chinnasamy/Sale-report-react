import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
  },
 summaryContainer: {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',       // ❗ prevents cards from wrapping to the next line
  overflowX: 'auto',        // ❗ enables horizontal scroll on smaller screens
  marginBottom: '20px',
  padding: '0 24px 0px 0px',
  gap: '16px',
  width: '100%',
},
summaryCard: {
  backgroundColor: '#f5f7fa',
  borderRadius: '12px',
  padding: '16px 12px',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e0e6ed',
  flex: '1 1 180px',     // 👈 Let each card grow or shrink
  maxWidth: '20%',       // 👈 Try to fit 5 in a row
  minWidth: '140px',     // 👈 Prevent from becoming unreadably small
  boxSizing: 'border-box',
},
  summaryTitle: {
  margin: 0,
  fontSize: '13px',
  fontWeight: 600,
  color: '#6b7280',
  whiteSpace: 'nowrap',
},

summaryValue: {
  margin: '6px 0 0',
  fontSize: '16px',
  fontWeight: 700,
  color: '#111827',
},

  graphContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e3e8ee',
    width: '100%',
    maxWidth: '95%',
    height: '300px',
  },
  toggleRow: {
    display: 'flex',
    gap: '16px',
    margin: '16px 24px',
    alignItems: 'center',
  },
};

const formatPeriodLabel = (label) => {
  if (!label.includes("to")) return label;
  const [start, end] = label.split(" to ");
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate().toString().padStart(2, '0')}–${endDate.getDate().toString().padStart(2, '0')} ${startDate.toLocaleString('en-US', { month: 'short' })}`;
  }
  return `${startDate.getDate()} ${startDate.toLocaleString('en-US', { month: 'short' })} – ${endDate.getDate()} ${endDate.toLocaleString('en-US', { month: 'short' })}`;
};

const calculateStandardDeviation = (arr) => {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

const ReportSummary = ({ summary }) => {
  const [showAverage, setShowAverage] = useState(false);
  const [showMovingAvg, setShowMovingAvg] = useState(false);
  const [showStdDev, setShowStdDev] = useState(false);

  if (!summary) return null;

  const currentGraph = summary.growth_graph_data || [];
  const comparisonGraph = summary?.comparison?.growth_graph_data || [];

  const labels = currentGraph.map(point => formatPeriodLabel(point.period));
  const currentSaleValues = currentGraph.map(point => point.sale_value);
  const comparisonSaleValues = comparisonGraph.map(point => point.sale_value);

  const average = currentSaleValues.reduce((a, b) => a + b, 0) / currentSaleValues.length;
  const stdDev = calculateStandardDeviation(currentSaleValues);
  const averageLine = Array(currentSaleValues.length).fill(average);
  const stdDevUpper = Array(currentSaleValues.length).fill(average + stdDev);
  const stdDevLower = Array(currentSaleValues.length).fill(average - stdDev);

  const movingAverage = currentSaleValues.map((_, i, arr) => {
    const window = arr.slice(Math.max(0, i - 2), i + 3);
    return window.reduce((sum, val) => sum + val, 0) / window.length;
  });

  const shouldHideGraph = summary?.aggregation === "custom" || summary?.aggregation === "compare";
  const totalSaleValue = Math.round((summary.Total_Sale_Value || 0) + (summary?.comparison?.Total_Sale_Value || 0));
  const totalQuantitySold = Math.round((summary.Total_Quantity_Sold || 0) + (summary?.comparison?.Total_Quantity_Sold || 0));
  const totalItemsViewed = summary.Total_Items_Viewed || 0;
  const totalItemsAddedToCart = summary.Total_Items_Added_To_Cart || 0;
  const sellThroughRate = summary?.Sell_Through_Rate ?? null;

  const data = {
    labels,
    datasets: [
      {
        label: 'Current Period',
        data: currentSaleValues,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
      },
      ...(comparisonSaleValues.length > 0 ? [{
        label: 'Comparison Period',
        data: comparisonSaleValues,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#dc2626',
      }] : []),
      ...(showAverage ? [{
        label: 'Average',
        data: averageLine,
        borderColor: '#10b981',
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      }] : []),
      ...(showMovingAvg ? [{
        label: 'Moving Average',
        data: movingAverage,
        borderColor: '#8b5cf6',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      }] : []),
      ...(showStdDev ? [
        {
          label: '+1 Std Dev',
          data: stdDevUpper,
          borderColor: '#f97316',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: '-1 Std Dev',
          data: stdDevLower,
          borderColor: '#f97316',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
        },
      ] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: { size: 13, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { weight: 'bold', size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 6,
        padding: 10,
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb', borderDash: [3, 3] },
        ticks: {
          color: '#4b5563',
          font: { size: 12 },
          callback: (value) => `₹${value.toLocaleString()}`,
        },
        title: {
          display: true,
          text: 'Sale Value (₹)',
          color: '#374151',
          font: { size: 13, weight: '600' },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#4b5563',
          font: { size: 12 },
          maxRotation: 25,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        title: {
          display: true,
          text: 'Period',
          color: '#374151',
          font: { size: 13, weight: '600' },
        },
      },
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={{ width: '100%' }}>
        <div style={styles.summaryContainer}>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Sale Value</h4>
            <p style={styles.summaryValue}>₹{totalSaleValue.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Quantity Sold</h4>
            <p style={styles.summaryValue}>{totalQuantitySold.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Items Viewed</h4>
            <p style={styles.summaryValue}>{totalItemsViewed.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Items Added to Cart</h4>
            <p style={styles.summaryValue}>{totalItemsAddedToCart.toLocaleString()}</p>
          </div>
          {!shouldHideGraph && sellThroughRate !== null && (
            <div style={styles.summaryCard}>
              <h4 style={styles.summaryTitle}>Sell Through Rate</h4>
              <p style={styles.summaryValue}>{sellThroughRate.toFixed(2)}%</p>
            </div>
          )}
        </div>

        {!shouldHideGraph && (
          <>
            <div style={styles.toggleRow}>
              <label><input type="checkbox" checked={showAverage} onChange={() => setShowAverage(!showAverage)} /> Show Average</label>
              <label><input type="checkbox" checked={showMovingAvg} onChange={() => setShowMovingAvg(!showMovingAvg)} /> Show Moving Avg</label>
              <label><input type="checkbox" checked={showStdDev} onChange={() => setShowStdDev(!showStdDev)} /> Show Std Dev</label>
            </div>
            <div style={styles.graphContainer}>
              <Line data={data} options={options} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;
