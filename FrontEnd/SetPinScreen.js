import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useTheme } from './styles/useTheme';

export default function SetPinScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const { theme } = useTheme();
  const savePin = async () => {
    if (pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits.");
      return;
    }

    try {

      await axios.post(`${API_BASE_URL}/set-pin`, { pin });
      Alert.alert("Success", "PIN saved!");
      navigation.navigate('Settings'); // go to enter screen after setting
    } catch (err) {
      Alert.alert("Error", "Failed to save PIN");
    }
  };

  return (
    <View style={{ padding: 20 , backgroundColor: theme.background, flex:1}}>
      <Text style={{color:theme.textColor}}>Set a 4-digit PIN:</Text>
      <TextInput
        keyboardType="numeric"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        style={{
          borderBottomWidth: 1,
          borderColor: theme.textColor,
          marginBottom: 20,
          fontSize: 24,
          textAlign: 'center',
          color: theme.textColor
        }}
        secureTextEntry
      />
      <Button title="Save PIN" onPress={savePin} />
    </View>
  );
}
