import { NavigationContainer } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Expenses" component={Expenses} />
        <Stack.Screen name="AllExpenses" component={AllExpenses} />
        <Stack.Screen name="GetIncome" component={GetIncome} />
        <Stack.Screen name="SpendingReport" component={SpendingReport}/>
        <Stack.Screen name="FinancialPlanScreen" component={FinancialPlanScreen}/>
        <Stack.Screen name="ExpenseLimit" component={ExpenseLimitScreen} />
        <Stack.Screen name="FinancialPlan" component={FinancialPlanScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
