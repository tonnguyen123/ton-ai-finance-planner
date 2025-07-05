import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles/mainPage';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Top content */}
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={{ fontSize: 22, color: 'black' }}>
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
            <Text style={{ marginBottom: 10 }}>Earning</Text>
            <FontAwesome5 name="envelope-open-text" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => navigation.navigate("SpendingReport")}
          >
            <Text style={{ marginBottom: 10 }}>Notes by voice</Text>
            <FontAwesome5 name="sticky-note" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom nav bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 60,
          borderTopWidth: 1,
          borderColor: '#ccc',
          backgroundColor: '#f5f5f5',
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate("ExpenseLimit")}>
          <MaterialIcons name="attach-money" size={28} color="black" />
          <Text style={{ fontSize: 12 }}>Limit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("FinancialPlan")}>
          <MaterialIcons name="bar-chart" size={28} color="black" />
          <Text style={{ fontSize: 12 }}>Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <MaterialIcons name="settings" size={28} color="black" />
          <Text style={{ fontSize: 12 }}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
