import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper'; // Input with Material Design
import CalendarPicker from 'react-native-calendar-picker'; // Calendar for date selection
import { API_BASE_URL } from '@env'; // API base URL from environment file
import { useNavigation } from '@react-navigation/native'; // Navigation hook

export default function GoalPlanner() {
  // State for form fields
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const navigation = useNavigation(); // Navigation instance

  // Function to create a goal
  const createGoal = async () => {
    // Validation: Make sure all fields are filled
    if (startDate === null || endDate === null || goalName === '' || targetAmount === '') {
      Alert.alert("Please fill all information!");
      return;
    }

    try {
      // Prepare goal info to send to backend
      const GoalInfo = {
        goal_name: goalName,
        target_amount: targetAmount,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      // Send POST request to backend
      const res = await fetch(`${API_BASE_URL}/create-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(GoalInfo),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Goal created successfully!");
        navigation.navigate('Goals'); // Navigate back to goals screen
      } else {
        Alert.alert("Error", data.error || "Failed to create goal");
      }
    } catch (error) {
      console.error("Create goal error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Goal Name Input */}
      <Text style={styles.label}>Name of goal:</Text>
      <TextInput
        value={goalName}
        onChangeText={setGoalName}
        placeholder="Enter name of the goal"
        mode="outlined"
        style={styles.input}
      />

      {/* Start Date Picker */}
      <Text style={styles.label}>Select Start Date:</Text>
      <CalendarPicker
        onDateChange={(date) => setStartDate(date)}
        selectedStartDate={startDate}
      />
      {startDate && (
        <Text style={styles.datePreview}>
          Start Date: {startDate.toISOString().split('T')[0]}
        </Text>
      )}

      {/* End Date Picker */}
      <Text style={styles.label}>Select End Date:</Text>
      <CalendarPicker
        onDateChange={(date) => setEndDate(date)}
        selectedStartDate={endDate}
        minDate={startDate} // Cannot pick a date before start
      />
      {endDate && (
        <Text style={styles.datePreview}>
          End Date: {endDate.toISOString().split('T')[0]}
        </Text>
      )}

      {/* Target Amount Input */}
      <Text style={styles.label}>Target Amount ($):</Text>
      <TextInput
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="numeric"
        placeholder="Enter target amount"
        mode="outlined"
        style={styles.input}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => createGoal()}
      >
        <Text style={styles.buttonText}>Create Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  datePreview: {
    marginTop: 5,
    fontStyle: 'italic',
  },
  input: {
    marginTop: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#0984e3',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
