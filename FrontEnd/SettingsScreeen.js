import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from './styles/useTheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BottomTabs from './BottomTab';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
       <KeyboardAwareScrollView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
             <TouchableOpacity onPress={() => navigation.navigate("SetPinScreen")}>
        <Text style={[styles.text, { color: theme.textColor }]}>Change password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ChangeTheme")}>
        <Text style={[styles.text, { color: theme.textColor }]}>Change Theme</Text>
      </TouchableOpacity>
      
      </KeyboardAwareScrollView>
     <BottomTabs></BottomTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
