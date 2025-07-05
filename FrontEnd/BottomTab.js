import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


// Screens (replace with your actual screen components)
import SettingsScreen from './SettingsScreeen';
import ExpenseLimitScreen from './ExpenseLimitScreen';
import FinancialPlanScreen from './FinancialPlanScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="FinancialPlan"
        component={FinancialPlanScreen}
        options={{
          tabBarLabel: 'Plan',
 
        }}
      />
      <Tab.Screen
        name="ExpenseLimit"
        component={ExpenseLimitScreen}
        options={{
          tabBarLabel: 'Limits',
       
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        
        }}
      />
    </Tab.Navigator>
  );
}
