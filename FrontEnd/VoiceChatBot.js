import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Voice from '@react-native-community/voice'; // For voice recognition
import * as Speech from 'expo-speech'; // Optional: to speak the bot's answer
import axios from 'axios';
import { useTheme } from './styles/useTheme';
import { API_BASE_URL } from '@env';

export default function VoiceChatBot() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [listening, setListening] = useState(false);
  const { theme } = useTheme();

  // Handle results from speech-to-text
  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      const text = event.value[0];
      setTranscript(text);
      handleSendToBot(text); // auto-send to bot when spoken
    };
    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  const startListening = async () => {
    setTranscript('');
    setResponse('');
    try {
      await Voice.start('en-US');
      setListening(true);
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (e) {
      console.error('Voice stop error:', e);
    }
  };

  // Send the question to Flask backend
  const handleSendToBot = async (question) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chatbot`, { question });
      setResponse(res.data.answer);

      // Optional: Speak the result
      Speech.speak(res.data.answer);
    } catch (e) {
      console.error('Bot error:', e);
      setResponse("Sorry, something went wrong.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.textColor }]}>Ask a Question:</Text>
      
      <TouchableOpacity style={styles.button} onPress={startListening}>
        <Text style={styles.buttonText}>🎤 Start Speaking</Text>
      </TouchableOpacity>

      {listening && (
        <TouchableOpacity style={styles.button} onPress={stopListening}>
          <Text style={styles.buttonText}>🛑 Stop</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.output}>
        <Text style={{ color: theme.textColor }}>You said: {transcript}</Text>
        <Text style={{ marginTop: 10, color: theme.textColor }}>Bot says: {response}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 20, marginBottom: 10 },
  button: {
    backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16 },
  output: { marginTop: 20 },
});
