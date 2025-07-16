import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInput } from 'react-native-paper';
import { API_BASE_URL } from '@env';
import { useTheme } from './styles/useTheme';
import AllLimits from './AllLimits';
import { useNavigation } from '@react-navigation/native';
import BottomTabs from './BottomTab';

export default function ExpenseLimitScreen({ navigation }) {
  const { theme } = useTheme(); // Get current theme (text and background color)
  
  // State for selected month, defaulting to current month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // State for selected year, defaulting to current year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State to store the user-entered limit
  const [limit, setLimit] = useState(0);

  // Month options for dropdown
  const months = [
    { label: 'Every month', value: 0 },
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

  // Generate a list of the next 5 years for the year dropdown
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push({ label: (currentYear + i).toString(), value: currentYear + i });
  }

  // Function to submit the new budget limit to the backend
  const createBudgetLimit = async () => {
    const newLimit = {
      limit: parseFloat(limit), // Ensure the limit is a float
      month: selectedMonth,
      year: selectedYear,
    };

    try {
      // Send POST request to API to save the budget limit
      const res = await fetch(`${API_BASE_URL}/create-budget-limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit),
      });

      const data = await res.json();

      // Show success or error message from the response
      Alert.alert(data.message || 'Something went wrong');
    } catch (error) {
      // Show alert if network/API call fails
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.textColor }]}>Create Budget Limit</Text>

      {/* Month selection */}
      <Text style={[styles.label, { color: theme.textColor }]}>Select Month</Text>
      <Dropdown
        style={[styles.dropdown, { color: theme.textColor }]}
        placeholderStyle={{ color: theme.textColor }}
        selectedTextStyle={{ color: theme.textColor }}
        data={months}
        labelField="label"
        valueField="value"
        value={selectedMonth}
        onChange={item => setSelectedMonth(item.value)}
      />

      {/* Year selection */}
      <Text style={[styles.label, { color: theme.textColor }]}>Select Year</Text>
      <Dropdown
        style={[styles.dropdown, { color: theme.textColor }]}
        placeholderStyle={{ color: theme.textColor }}
        selectedTextStyle={{ color: theme.textColor }}
        data={years}
        labelField="label"
        valueField="value"
        value={selectedYear}
        onChange={item => setSelectedYear(item.value)}
      />

      {/* Budget limit input */}
      <Text style={{ color: theme.textColor }}>Enter Limit: </Text>
      <TextInput
        keyboardType="numeric"
        placeholder="Expense Limit $"
        placeholderTextColor={theme.textColor}
        style={{
          width: 150,
          height: 50,
          color: theme.textColor,
          borderBottomColor: theme.textColor,
          borderBottomWidth: 1,
          paddingHorizontal: 10,
          marginTop: 5,
          fontSize: 16,
        }}
        onChangeText={(val) => setLimit(val)}
      />

      {/* Button to create budget limit */}
      <TouchableOpacity style={styles.button} onPress={createBudgetLimit}>
        <Text style={{ color: 'white', marginBottom: 10 }}>Create</Text>
      </TouchableOpacity>

      {/* Navigate to view all budget limits */}
      <TouchableOpacity
        style={{
          backgroundColor: '#3ee0f3',
          borderRadius: 3,
          width: 160,
          height: 30,
          marginTop: 10,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate(AllLimits)} // Navigate to AllLimits screen
      >
        <Text style={{ color: 'white' }}>View Budget Limits</Text>
      </TouchableOpacity>

      {/* Bottom tab navigation */}
      <BottomTabs />
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: 150,
  },
  label: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
});
