import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; // Icon libraries for UI
import { useNavigation } from '@react-navigation/native'; // For navigating between screens
import { useTheme } from './styles/useTheme'; // Custom theme hook for dynamic theming

export default function BottomTabs() {
  const navigation = useNavigation(); // Hook to access navigation object
  const { theme } = useTheme(); // Get current theme colors

  return (
    <View
      style={{
        flexDirection: 'row', // Arrange icons horizontally
        justifyContent: 'space-around', // Even spacing between icons
        alignItems: 'center', // Vertically center icons
        height: 60, // Height of bottom tab bar
        borderTopWidth: 1, // Thin top border
        borderColor: '#ccc', // Light gray border color
        backgroundColor: theme.background, // Use theme's background color
      }}
    >
      {/* Home Tab */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <MaterialIcons name="home" size={28} color={theme.textColor} />
        <Text style={{ fontSize: 12, color: theme.textColor }}>Home</Text>
      </TouchableOpacity>

      {/* ChatBot Tab */}
      <TouchableOpacity onPress={() => navigation.navigate("ChatBotScreen")} style={{ alignItems: 'center' }}>
        <MaterialCommunityIcons name="robot" size={28} color={theme.textColor} />
        <Text style={{ fontSize: 12, color: theme.textColor }}>Chat Bot</Text>
      </TouchableOpacity>

      {/* Goals / Plan Tab */}
      <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
        <MaterialIcons name="bar-chart" size={28} color={theme.textColor} />
        <Text style={{ fontSize: 12, color: theme.textColor }}>Plan</Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <MaterialIcons name="settings" size={28} color={theme.textColor} />
        <Text style={{ fontSize: 12, color: theme.textColor }}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
