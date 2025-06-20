import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './FrontEnd/Home'; // example screen
import Expenses from './FrontEnd/Expenses'; // your Expenses.js
import AllExpenses from './FrontEnd/AllExpenses';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Expenses" component={Expenses} />
        <Stack.Screen name="AllExpenses" component={AllExpenses} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
