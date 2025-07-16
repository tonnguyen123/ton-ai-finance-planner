import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, XAxis, YAxis, Grid } from 'react-native-svg-charts'; // Chart components
import { API_BASE_URL } from '@env'; // API base URL from environment variables
import axios from 'axios'; // HTTP client for API requests
import { Dropdown } from 'react-native-element-dropdown'; // Dropdown picker UI component

import Svg, { G, Path, Text as SvgText } from 'react-native-svg'; // SVG elements for pie chart
import * as d3Shape from 'd3-shape'; // D3 for arc shapes in pie chart
import { useTheme } from './styles/useTheme'; // Custom hook for app theming


export default function SpendingReport({ navigation, route }) {
  const { theme } = useTheme(); // Get current theme colors

  // State to hold expense, earnings, and breakdown data
  const [allExpense, setAllExpense] = useState({});
  const [earningsData, setEarningsData] = useState({});
  const [typeExpenses, setTypeExpenses] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Current month as default (0-based)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year as default
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({}); // Expense breakdown by category per month-year

  // Receive any pre-calculated typeTotals from navigation params (fallback to sample)
  const { typeTotals = { Groceries: 20.8, Rent: 450 } } = route.params || {};

  // Setup variables for pie chart size, radius, and color palette
  const size = 400;
  const radius = size / 2;
  const colors = ['#f39c12', '#e74c3c', '#2ecc71', '#3498db', '#65d0db', '#ab65db', '#d9db65'];

  // Key string to index monthly data for the selected month and year (month is 0-based in JS, so +1)
  const currentKey = `${selectedMonth + 1}-${selectedYear}`;

  // Get income and expense for the selected month-year or default to 0
  const income = earningsData[currentKey] || 0;
  const expense = allExpense[currentKey] || 0;

  // Get the detailed expense breakdown for the selected month-year or empty array
  const selectedPieItems = monthlyBreakdown[currentKey] || [];

  // Prepare pie chart data with label, value, and assigned color cycling through palette
  const pieData = selectedPieItems.map((item, i) => ({
    label: item.name,
    value: item.value,
    color: colors[i % colors.length],
  }));

  // Generate arcs for pie slices using d3 pie layout based on value
  const arcs = d3Shape.pie().value(d => d.value)(pieData);
  // Arc generator with outer radius and zero inner radius (full pie, not donut)
  const arcGen = d3Shape.arc().outerRadius(radius).innerRadius(0);

  // Total sum of pie values, for calculating percentages
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  // Logging for debugging
  console.log("typeTotals: ", typeTotals);

  // Dropdown data for months (1 to 12 with labels)
  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  // Prepare dropdown data for years (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({ label: year.toString(), value: year });
  }
  years.reverse(); // Show ascending order of years

  // Fetch expenses and earnings on component mount
  useEffect(() => {
    fetchSavedExpenses();
    fetchEarnings();
  }, []);

  // Fetch expenses from API, aggregate by month-year and type, and update state
  const fetchSavedExpenses = async () => {
    const monthlyTotals = {};
    const typeExpenses = {};
    const monthlyDetailedExpenses = {};

    try {
      const response = await axios.get(`${API_BASE_URL}/get-expenses`);
      const expenses = Array.isArray(response.data)
        ? response.data
        : response.data?.expenses || [];

      console.log("Expense: ", expenses);

      for (let entry of expenses) {
        // Parse date safely with fixed noon time to avoid timezone issues
        const dateObj = new Date(entry.date + 'T12:00:00');
        const key = `${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`; // month-year key

        const type = entry.receipt_type;
        const value = parseFloat(entry.total_price) || 0;

        // Sum total expenses per month-year
        monthlyTotals[key] = (monthlyTotals[key] || 0) + value;

        // Sum expenses by type per month-year
        typeExpenses[`${key} ${type}`] = (typeExpenses[`${key} ${type}`] || 0) + value;

        // Build detailed expense list for pie chart per month-year
        if (!monthlyDetailedExpenses[key]) {
          monthlyDetailedExpenses[key] = [];
        }
        const existing = monthlyDetailedExpenses[key].find(item => item.name === type);
        if (existing) {
          existing.value += value;
        } else {
          monthlyDetailedExpenses[key].push({ name: type, value });
        }
      }

      // Debug logs for validation
      console.log("Type Expenses: ", typeExpenses);
      console.log("Expense monthly totals:", monthlyTotals);
      console.log("Grouped by Month-Year:", monthlyDetailedExpenses);

      // Update state with aggregated data
      setTypeExpenses(typeExpenses);
      setAllExpense(monthlyTotals);
      setMonthlyBreakdown(monthlyDetailedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  // Fetch earnings from API and aggregate by month-year
  const fetchEarnings = async () => {
    const monthlyTotals = {};

    try {
      const response = await axios.get(`${API_BASE_URL}/get-earnings`);
      const earnings = Array.isArray(response.data)
        ? response.data
        : response.data?.earnings || [];

      console.log("Earnings: ", earnings);

      for (let entry of earnings) {
        const dateObj = new Date(entry.date + 'T12:00:00');
        console.log("Full date: ", dateObj);

        const key = `${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;
        console.log("Month is: ", key);

        const value = parseFloat(entry.income) || 0;
        monthlyTotals[key] = (monthlyTotals[key] || 0) + value;
      }

      console.log("Earning monthly totals:", monthlyTotals);
      setEarningsData(monthlyTotals);

    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  };

  // Data array for bar chart: expenses and income
  const chartData = [expense, income];

  // Custom label component for BarChart bars to show values on top
  const Labels = ({ x, y, bandwidth, data }) => (
    data.map((bar, index) => (
      <SvgText
        key={index}
        x={x(index) + bandwidth / 2}
        y={y(bar.value) + 15}
        fontSize={14}
        fill="white"
        alignmentBaseline="middle"
        textAnchor="middle"
      >
        {bar.value}
      </SvgText>
    ))
  );

  // Render UI with ScrollView
  return (
    <ScrollView
      style={{
        padding: 20,
        backgroundColor: theme.background,
        flex: 1,
      }}
    >
      {/* Header text */}
      <Text style={{ marginBottom: 5, fontWeight: 'bold', color: theme.textColor }}>
        Income vs Expenses
      </Text>

      {/* Month selection dropdown */}
      <Text style={{ marginBottom: 5, fontWeight: 'bold', color: theme.textColor }}>
        Select Month
      </Text>
      <Dropdown
        style={styles.dropdown}
        data={months}
        labelField="label"
        valueField="value"
        value={selectedMonth + 1} // Dropdown expects 1-based month values
        onChange={item => setSelectedMonth(item.value - 1)} // Convert back to 0-based month internally
      />

      {/* Year selection dropdown */}
      <Text style={{ marginBottom: 5, fontWeight: 'bold', color: theme.textColor }}>
        Select Year
      </Text>
      <Dropdown
        style={styles.dropdown}
        data={years}
        labelField="label"
        valueField="value"
        value={selectedYear}
        onChange={item => setSelectedYear(item.value)}
      />

      {/* Bar chart comparing expense vs income */}
      <View style={{ height: 250, flexDirection: 'row' }}>
        <YAxis
          data={chartData}
          contentInset={{ top: 20, bottom: 10 }}
          svg={{ fontSize: 0, fill: 'transparent' }} // Hide Y-axis numbers for clean look
        />
        <BarChart
          style={{ flex: 1, marginLeft: 10 }}
          data={[
            { value: expense, svg: { fill: '#ff7675' } }, // red for expenses
            { value: income, svg: { fill: '#55efc4' } },  // green for income
          ]}
          yAccessor={({ item }) => item.value}
          spacingInner={0.4}
          contentInset={{ top: 20, bottom: 10 }}
          gridMin={0}
        >
          <Grid />
          <Labels data={[{ value: expense }, { value: income }]} />
        </BarChart>
      </View>

      {/* Labels below bar chart */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={{ marginLeft: 80, fontSize: 12, color: theme.textColor }}>Expenses</Text>
        <Text style={{ marginRight: 40, fontSize: 12, color: theme.textColor }}>Earnings</Text>
      </View>

      {/* Percentage spent message */}
      {income > 0 && (
        <View>
          <Text style={{ color: theme.textColor }}>
            You have spent {parseFloat((expense / income) * 100).toFixed(2)}% of your income
          </Text>
        </View>
      )}

      {/* Expense Breakdown header */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
          color: theme.textColor,
        }}
      >
        Expense Breakdown
      </Text>

      {/* Pie chart showing expense categories */}
      <Svg width={size} height={size}>
        <G x={radius} y={radius}>
          {arcs.map((arc, index) => {
            const path = arcGen(arc);
            const [labelX, labelY] = arcGen.centroid(arc);
            const percent = ((arc.data.value / total) * 100).toFixed(1);
            return (
              <G key={index}>
                <Path d={path} fill={arc.data.color} />
                <SvgText
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {`(${percent}%)`}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>

      {/* Legend for pie chart categories */}
      <View style={{ marginTop: 20 }}>
        {pieData.map((item, index) => (
          <View
            key={index}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: item.color,
                marginRight: 8,
              }}
            />
            <Text style={{ color: theme.textColor }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Styles for dropdown and other UI elements
const styles = StyleSheet.create({
  container: {}, // Not currently used
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
