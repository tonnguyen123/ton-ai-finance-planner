import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './FrontEnd/Home'; // example screen
import Expenses from './FrontEnd/Expenses'; // your Expenses.js
import AllExpenses from './FrontEnd/AllExpenses';
import GetIncome from './FrontEnd/GetIncome';
import SpendingReport from './FrontEnd/SpendingReport';
import FinancialPlanScreen from './FrontEnd/FinancialPlanScreen';
import ExpenseLimitScreen from './FrontEnd/ExpenseLimitScreen';
import SettingsScreen from './FrontEnd/SettingsScreeen';
import BottomTabs from './FrontEnd/BottomTab';
import SetPinScreen from './FrontEnd/SetPinScreen';
import EnterPinScreen from './FrontEnd/EnterPinScreen';
import ChangeTheme from './FrontEnd/ChangeTheme';
import AllLimits from './FrontEnd/AllLimits';
import GoalPlanner from './FrontEnd/GoalPlanner';
import Goals  from './FrontEnd/Goals';
import ChatBotScreen from './FrontEnd/ChatBotScreen';
import { FinanceDataProvider } from './FrontEnd/FinanceDataProvider';
import { ThemeProvider } from './FrontEnd/styles/ThemeContext';
import { useTheme } from './FrontEnd/styles/useTheme';

const Stack = createNativeStackNavigator();

export default function App() {
  const [backgroundColor,setBackGroundColor] = useState('');
  const [textColor,setTextColor] = useState('');
  const { theme } = useTheme();

  //Get the theme from the database to set theme for the app
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-theme`);
        const theme = res.data;
        await AsyncStorage.setItem('theme', JSON.stringify(theme));
        setBackGroundColor(theme.background);
        setTextColor(theme.textColor);
        console.log(textColor);
        console.log(backgroundColor);
      } catch (err) {
        console.error('Failed to fetch theme:', err);
      }
    };
    fetchTheme();
  }, []);
  
  return (
    <FinanceDataProvider>
      <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EnterPinScreen" component={EnterPinScreen}  options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="Home" component={Home}  options={{headerStyle: { backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="Expenses" component={Expenses} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="AllExpenses" component={AllExpenses} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="GetIncome" component={GetIncome} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="SpendingReport" component={SpendingReport} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="FinancialPlanScreen" component={FinancialPlanScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="ExpenseLimit" component={ExpenseLimitScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="FinancialPlan" component={FinancialPlanScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="SetPinScreen" component={SetPinScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="EnterPin" component={EnterPinScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>
        <Stack.Screen name="ChangeTheme" component={ChangeTheme} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>

        <Stack.Screen name="AllLimits" component={AllLimits} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>


        <Stack.Screen name="GoalPlanner" component={GoalPlanner} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>


        <Stack.Screen name="Goals" component={Goals} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>

        <Stack.Screen name="ChatBotScreen" component={ChatBotScreen} options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}/>


      </Stack.Navigator>
    </NavigationContainer>

    </FinanceDataProvider>
    
  );
}
