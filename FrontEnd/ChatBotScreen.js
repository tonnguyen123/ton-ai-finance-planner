import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from './styles/useTheme';
import { API_BASE_URL } from '@env';

export default function ChatBotScreen() {
  const { theme } = useTheme();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  


  //Send question to OpenRouter AI to analyze the current data to answer question via chat bot.
  const askBot = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      const botAnswer = data.answer || 'Sorry, I could not understand that.';

      setChatHistory((prev) => [...prev, { type: 'user', text: question }, { type: 'bot', text: botAnswer }]);
      setResponse(botAnswer);
    } catch (err) {
      console.error('Chatbot error:', err);
      setResponse('⚠️ Error talking to the bot.');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.textColor, marginBottom: 10 }}>
          AI Financial Assistant
        </Text>

        {chatHistory.map((msg, index) => (
          <View
            key={index}
            style={{
              backgroundColor: msg.type === 'user' ? '#007AFF33' : '#34A85333',
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
              alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <Text style={{ color: theme.textColor }}>{msg.text}</Text>
          </View>
        ))}

        {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 10 }} />}

        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask something like: What is my spending this month?"
          placeholderTextColor='black'
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 8,
            borderColor: '#ccc',
            borderWidth: 1,
            marginBottom: 10,
            color: 'black',
          }}
          multiline
        />

        <TouchableOpacity
          onPress={askBot}
          style={{
            backgroundColor: '#007AFF',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Ask AI</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
