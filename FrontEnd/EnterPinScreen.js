import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function EnterPinScreen({ navigation }) {
  // State for the PIN the user enters
  const [enteredPin, setEnteredPin] = useState('');

  // State for the correct PIN fetched from the backend
  const [correctPin, setCorrectPin] = useState(null);

  // State to control the loading indicator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch the stored PIN from backend
    const fetchPin = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get-pin`);
        const pin = response.data.pin;
        setCorrectPin(pin);

        // If no PIN is set in the backend, skip this screen and go to Home
        if (!pin) {
          navigation.replace('Home');
        }
      } catch (error) {
        // Show alert if fetching the PIN fails
        Alert.alert('Error', 'Failed to fetch PIN');
      } finally {
        // Stop loading once request completes
        setLoading(false);
      }
    };

    // Call the function to fetch the PIN when component mounts
    fetchPin();
  }, []);

  // Function to compare entered PIN with the correct PIN
  const checkPin = () => {
    if (enteredPin === correctPin) {
      // If correct, navigate to Home screen
      navigation.replace('Home');
    } else {
      // If incorrect, show error alert
      Alert.alert('Incorrect', 'Wrong PIN. Try again.');
    }
  };

  // While loading, show a spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Main UI to enter the PIN
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter your 4-digit PIN:</Text>

      {/* Input for the PIN */}
      <TextInput
        keyboardType="numeric"
        maxLength={4}
        value={enteredPin}
        onChangeText={setEnteredPin}
        style={{
          borderBottomWidth: 1,
          marginBottom: 20,
          fontSize: 24,
          textAlign: 'center',
          padding: 10,
        }}
        secureTextEntry // hides the digits for security
      />

      {/* Unlock button is only enabled if 4 digits are entered */}
      <Button title="Unlock" onPress={checkPin} disabled={enteredPin.length < 4} />
    </View>
  );
}
