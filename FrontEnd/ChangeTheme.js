import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from './styles/useTheme'; // Custom hook to access and update the app's theme
import { Dropdown } from 'react-native-element-dropdown'; // Dropdown component for mode selection
import { API_BASE_URL } from '@env'; // Backend URL from environment variable
import { useNavigation } from '@react-navigation/native'; // Navigation hook

export default function ChangeTheme() {
  const { theme, updateTheme } = useTheme(); // Get current theme and theme updater
  const [textColor, setTextColor] = useState(theme.textColor); // State for previewing text color
  const [background, setBackground] = useState(theme.background); // State for previewing background
  const [chosenMode, setMode] = useState(null); // Stores selected theme mode
  const navigation = useNavigation(); // For navigating back after save

  // Options for dropdown
  const options = [
    { label: 'Dark Mode', value: 'dark' },
    { label: 'Light Mode', value: 'light' },
  ];

  // Handle user selection and preview theme colors accordingly
  const handleThemeChange = (mode) => {
    setMode(mode);
    if (mode === 'dark') {
      setTextColor('#ffffff');
      setBackground('#000000');
    } else {
      setTextColor('#000000');
      setBackground('#ffffff');
    }
  };

  // Save the selected theme both locally and to backend
  const changeTheme = async (textColor, background) => {
    const theme = { textColor, background };
    await updateTheme(theme); // Update theme in context and local storage
    await fetch(`${API_BASE_URL}/update-theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme), // Send new theme to Flask backend
    });
    navigation.goBack(); // Go back to previous screen after saving
  };

  // Update preview if theme changes from elsewhere in the app
  useEffect(() => {
    setTextColor(theme.textColor);
    setBackground(theme.background);
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>Customize Theme</Text>

      {/* Dropdown for selecting dark/light mode */}
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        value={chosenMode}
        placeholder="Select Mode"
        onChange={(item) => handleThemeChange(item.value)}
        style={{
          height: 50,
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 20,
        }}
        placeholderStyle={{ color: textColor }}
        selectedTextStyle={{ color: textColor }}
      />

      {/* Save button */}
      <View style={styles.buttonContainer}>
        <Button title="Save Theme" onPress={() => changeTheme(textColor, background)} />
      </View>
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
