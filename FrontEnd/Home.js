import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { styles } from './styles/mainPage';
import { FontAwesome5 } from '@expo/vector-icons';
import BottomTabs from './BottomTab';
import { useTheme } from './styles/useTheme';

export default function Home() {
  const navigation = useNavigation();
  const { theme } = useTheme(); 

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={theme.background} />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.title}>
          <Text style={{ fontSize: 22, color: theme.textColor }}>
            Ton's AI Financial Management App
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.buttonSpacing}
            onPress={() => navigation.navigate("Expenses")}
          >
            <Text style={{ marginBottom: 10 }}>Scan Receipt AI</Text>
            <FontAwesome5 name="money-check-alt" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.docButton}
            onPress={() => navigation.navigate("AllExpenses")}
          >
            <Text style={{ marginBottom: 10 }}>All Expenses</Text>
            <FontAwesome5 name="file-alt" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emailbutton}
            onPress={() => navigation.navigate("GetIncome")}
          >
            <Text style={{ marginBottom: 10 }}>Scan Pay Slip AI</Text>
            <FontAwesome5 name="envelope-open-text" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => navigation.navigate("GoalPlanner")}
          >
            <Text style={{ marginBottom: 10 }}>Create Goal</Text>
            <FontAwesome5 name="sticky-note" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomTabs />
    </View>
  );
}
