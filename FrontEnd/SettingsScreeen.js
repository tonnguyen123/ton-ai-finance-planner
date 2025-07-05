import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity>
        <Text>Change password</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Change Theme</Text>
      </TouchableOpacity>
    </View>
  );
}
