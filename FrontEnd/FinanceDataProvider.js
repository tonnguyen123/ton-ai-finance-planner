// Import necessary modules and libraries
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Create a context to provide financial data across the app
const FinanceDataContext = createContext();

// Context provider component that wraps children components
export const FinanceDataProvider = ({ children }) => {
  // Local state to store earnings and expenses
  const [earnings, setEarnings] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Helper function to store data in AsyncStorage for offline access
  const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value); // Convert data to string
      await AsyncStorage.setItem(key, jsonValue); // Store in local storage
    } catch (e) {
      console.error("Error storing data:", e); // Handle error
    }
  };

  // Fetch earnings from backend API
  const fetchEarnings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-earnings`); // API call
      const data = res.data.earnings || []; // Get data or fallback to empty array
      setEarnings(data); // Update state
      storeData('Earnings', data); // Save to AsyncStorage
    } catch (err) {
      console.error("Error fetching earnings:", err); // Handle error
    }
  };

  // Fetch expenses from backend API
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-expenses`); // API call
      const data = res.data.expenses || []; // Get data or fallback
      setExpenses(data); // Update state
      storeData('Expenses', data); // Save to AsyncStorage
    } catch (err) {
      console.error("Error fetching expenses:", err); // Handle error
    }
  };

  // Fetch earnings and expenses once when the component mounts
  useEffect(() => {
    fetchEarnings();
    fetchExpenses();
  }, []);

  // Provide earnings, expenses, and refetch functions to all child components
  return (
    <FinanceDataContext.Provider value={{ earnings, expenses, fetchEarnings, fetchExpenses }}>
      {children}
    </FinanceDataContext.Provider>
  );
};

// Custom hook for easier access to finance data from context
export const useFinanceData = () => useContext(FinanceDataContext);
