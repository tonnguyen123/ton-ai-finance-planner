import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import { Text as SvgText, G } from 'react-native-svg';

export default function SpendingReport() {
  const [allExpense, setAllExpense] = useState({});
  const [earningsData, setEarningsData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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


const currentYear = new Date().getFullYear();

// Create a list of the current year and the 4 years before it
const years = [];

for (let i = 0; i < 5; i++) {
  const year = currentYear - i;
  years.push({ label: year.toString(), value: year });
}

// This will show years like: 2025, 2024, 2023, 2022, 2021
// If you want the oldest year to appear first, you can reverse the list
years.reverse();

  useEffect(() => {
    fetchSavedExpenses();
    fetchEarnings();
  }, []);

  const fetchSavedExpenses = async () => {
    const monthlyTotals = {};
    try {
      const response = await axios.get(`${API_BASE_URL}/get-expenses`);
      const expenses = Array.isArray(response.data)
        ? response.data
        : response.data?.expenses || [];

      for (let entry of expenses) {
        const dateObj = new Date(entry.date + 'T12:00:00'); // timezone-safe
        const key = `${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;
        const value = parseFloat(entry.total_price) || 0;
        monthlyTotals[key] = (monthlyTotals[key] || 0) + value;
      }

      console.log("Expense monthly totals:", monthlyTotals);
      setAllExpense(monthlyTotals);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchEarnings = async () => {
    const monthlyTotals = {};
    try {
      const response = await axios.get(`${API_BASE_URL}/get-earnings`);
      const earnings = Array.isArray(response.data)
        ? response.data
        : response.data?.earnings || [];
      console.log("Earnings: ",earnings );
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

  const currentKey = `${selectedMonth }-${selectedYear}`;
  const income = earningsData[currentKey] || 0;
  const expense = allExpense[currentKey] || 0;

  const chartData = [expense, income];
  const chartLabels = ['Expenses', 'Earnings'];

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


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Income vs Expenses</Text>

      <Text style={styles.label}>Select Month</Text>
      <Dropdown
        style={styles.dropdown}
        data={months}
        labelField="label"
        valueField="value"
        value={selectedMonth}
        onChange={item => setSelectedMonth(item.value)}
      />

      <Text style={styles.label}>Select Year</Text>
      <Dropdown
        style={styles.dropdown}
        data={years}
        labelField="label"
        valueField="value"
        value={selectedYear}
        onChange={item => setSelectedYear(item.value)}
      />

      <View style={{ height: 250, flexDirection: 'row' }}>
        <YAxis
          data={chartData}
          contentInset={{ top: 20, bottom: 10 }}
          svg={{ fontSize: 0, fill: 'transparent' }} // hides Y-axis numbers
        />
        <BarChart
          style={{ flex: 1, marginLeft: 10 }}
          data={[
            { value: expense, svg: { fill: '#ff7675' } }, // red
            { value: income, svg: { fill: '#55efc4' } },  // green
          ]}
          yAccessor={({ item }) => item.value}
          spacingInner={0.4}
          contentInset={{ top: 20, bottom: 10 }}
          gridMin={0}
        >
          <Grid />
          <Labels />
        </BarChart>
      </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
      <Text style={{ marginLeft: 80, fontSize: 12, color: 'black' }}>Expenses</Text>
      <Text style={{ marginRight: 40, fontSize: 12, color: 'black' }}>Earnings</Text>
    </View>

    <View><Text>
      You have spent {parseFloat(expense/income * 100).toFixed(2)}% of your income
      </Text></View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
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
