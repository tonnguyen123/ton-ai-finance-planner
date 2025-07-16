// Imports
import { useEffect, useState } from "react";
import { API_BASE_URL } from '@env'; // Base API URL from env
import axios from "axios"; // HTTP client
import { useFinanceData } from "./FinanceDataProvider"; // Custom hook for financial data context
import { useTheme } from "./styles/useTheme"; // Custom theming hook
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Local storage
import BottomTabs from "./BottomTab"; // Bottom navigation
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; // Keyboard-safe scroll view

export default function Goals() {
  // State management
  const [goals, setGoals] = useState([]); // All user goals
  const [editingId, setEditingId] = useState(null); // ID of goal being edited
  const [editedGoal, setEditedGoal] = useState({}); // Edited goal data
  const { earnings, expenses } = useFinanceData(); // Access earnings & expenses from context
  const { theme } = useTheme(); // Current theme

  // Just for logging today's date in ISO format
  const today = new Date().toLocaleDateString('en-CA');
  console.log("Today is ", today);

  // Fetch stored monthly totals and expenses from AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const totals = await AsyncStorage.getItem('monthlyTypeTotals');
        const expense = await AsyncStorage.getItem('monthlyTotalExpenses');
        const parsedTotals = totals ? JSON.parse(totals) : null;

        setMonthlyTotals(parsedTotals); // ❗Note: setMonthlyTotals is undefined here unless declared somewhere else
        setMonthlyExpense(expense);     // ❗Note: setMonthlyExpense is also undefined

        console.log("Monthly totals in all months:", parsedTotals);
        console.log("Monthly expense in all months:", expense);
      } catch (error) {
        console.log("Error fetching data from AsyncStorage", error);
      }
    };

    fetchData();
  }, []);

  // Fetch goals from API
  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-goals`);
      setGoals(res.data.limits);
    } catch (error) {
      console.log("Error fetching goals:", error);
    }
  };

  // Delete a goal by ID
  const deleteGoal = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete-goal/${id}`);
      setGoals((prev) => prev.filter((goal) => goal.id !== id)); // Remove from UI
    } catch (error) {
      console.log("Error deleting goal:", error);
      Alert.alert("Error", "Could not delete goal.");
    }
  };

  // Format date to YYYY-MM-DD (ISO)
  const formatDate = (dateStr) => {
    return new Date(dateStr).toISOString().slice(0, 10);
  };

  // Calculate the percentage of goal progress
  const calculateGoalProgress = (goal) => {
    const startDateStr = formatDate(goal.start_time);
    const endDateStr = formatDate(goal.end_time);
    const todayStr = new Date().toISOString().slice(0, 10);

    // Use today's date if before goal end, else use the end date
    const effectiveEndStr = todayStr < endDateStr ? todayStr : endDateStr;

    // Filter earnings and expenses in the goal's time frame
    const earningsInRange = earnings.filter(e => {
      const entryDate = e.date;
      return entryDate >= startDateStr && entryDate <= effectiveEndStr;
    });

    const expensesInRange = expenses.filter(exp => {
      const entryDate = exp.date;
      return entryDate >= startDateStr && entryDate <= effectiveEndStr;
    });

    // Sum earnings and expenses
    const totalEarnings = earningsInRange.reduce((sum, e) => sum + e.income, 0);
    const totalExpenses = expensesInRange.reduce((sum, e) => sum + e.total_price, 0);

    // Calculate net savings and goal progress %
    const netSavings = totalEarnings - totalExpenses;
    const percentage = (netSavings / goal.target_amount) * 100;

    return Math.max(0, Math.min(percentage, 100)).toFixed(1); // Clamp 0-100
  };

  // Save the edited goal to the backend
  const saveEditedGoal = async () => {
    try {
      await axios.put(`${API_BASE_URL}/update-goal/${editingId}`, editedGoal);
      fetchGoals(); // Refresh goals
      setEditingId(null);
      setEditedGoal({});
    } catch (error) {
      console.log("Error updating goal:", error);
      Alert.alert("Error", "Could not update goal.");
    }
  };

  // Fetch goals when component mounts
  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAwareScrollView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ScrollView for goals list */}
        <ScrollView contentContainerStyle={styles.container}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              {editingId === goal.id ? (
                // Edit mode UI
                <>
                  <TextInput
                    style={styles.input}
                    value={editedGoal.goal_name}
                    onChangeText={(text) => setEditedGoal({ ...editedGoal, goal_name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    value={editedGoal.target_amount.toString()}
                    onChangeText={(text) =>
                      setEditedGoal({ ...editedGoal, target_amount: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={saveEditedGoal}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // View mode UI
                <>
                  <Text style={styles.name}>{goal.goal_name}</Text>
                  <Text>Target: ${goal.target_amount}</Text>
                  <Text>Start: {new Date(goal.start_time).toLocaleDateString()}</Text>
                  <Text>End: {new Date(goal.end_time).toLocaleDateString()}</Text>
                  <Text>Progress: {calculateGoalProgress(goal)}%</Text>

                  {/* Edit & Delete buttons */}
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(goal.id);
                      setEditedGoal({
                        goal_name: goal.goal_name,
                        target_amount: goal.target_amount,
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <Text style={[styles.buttonText, { color: "red" }]}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Persistent bottom navigation */}
        <BottomTabs />
      </KeyboardAwareScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  goalCard: {
    backgroundColor: "green",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "white",
  },
  buttonText: {
    color: "white",
    marginTop: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
});
