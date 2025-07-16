import {
  Platform,
  ScrollView,
  Button,
  Image,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import * as ImageManipulator from 'expo-image-manipulator';
import { useState, useRef } from 'react';

import { API_BASE_URL, OCR_API_KEY } from '@env';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useTheme } from './styles/useTheme';
import BottomTabs from './BottomTab';

export default function GetIncome() {
  const { theme } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [income, setIncome] = useState('');
  const [usedCamera, setUsedCamera] = useState(false);
  const [employer, setEmployer] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [manualEmployer, setManualEmployer] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [wantToEdit, setWantEdit] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const incomeFrequencyOptions = ['One-time', 'Monthly', 'Weekly', 'Bi-weekly'];

  const viewRef = useRef(null);
 
  const handleTypeChange = (text) => {
    setFrequency(text);
    if (text.length > 0) {
      const filtered = incomeFrequencyOptions.filter(option =>
        option.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setFrequency(suggestion);
    setFilteredSuggestions([]);
  };

  const handleChooseSource = () => {
    setManualMode(false);
    Alert.alert('Upload Pay Slip', 'Choose how you want to add your Pay Slip:', [
      { text: 'Camera', onPress: () => pickFromCamera() },
      { text: 'Photo Library', onPress: () => pickFromLibrary() },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: false, quality: 1 });
    if (!result.canceled && result.assets?.length > 0) {
      processPickedImage(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photo library is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ base64: false, quality: 1 });
    if (!result.canceled && result.assets?.length > 0) {
      processPickedImage(result.assets[0].uri);
    }
  };



const processPickedImage = async (uri) => {
  try {
    setImageUri(uri);

    // 🔽 Resize & compress image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], //Resize and compress picture to send it toi OCR Space to extract text from pay slip.
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    //Encoding the taken picture to send it to OCR Space API to extract text from it.
    const base64Image = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Compressed image size likely under limit");

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('apikey', OCR_API_KEY);
    formData.append('filetype', 'JPG');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const result = await response.json();
    

    const fullText = result.ParsedResults?.[0]?.ParsedText;

    if (!fullText) {
      throw new Error('No text extracted from image.');
    }

    console.log(" Extracted Text:", fullText);

    const gptResponse = await fetch(`${API_BASE_URL}/parse-payslip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullText }),
    });

    const raw = await gptResponse.text();
    console.log("Raw backend response:", raw);

    let parsed;
    try {
      parsed = JSON.parse(raw);  // ✅ parse the text manually
    } catch (err) {
      console.error("JSON parsing failed:", err);
      Alert.alert("AI Error", "Could not parse response:\n" + raw);
      return;
    }
    console.log("Parsed data is ", parsed);
    setEmployer(parsed.employer || '');
    setIncome(parsed.income.replace(/[$,]/g, '') || '');
    setPaymentDate(parsed.payment_date || '');
    setFrequency(parsed.frequency || 'One-time');
    setUsedCamera(true);
    setWantEdit(true);
  } catch (error) {
    console.error('Image processing failed:', error);
    Alert.alert('Error', 'Could not extract data from image.');
  }
};





  const handleScreenshotAndUpload = async () => {
    setWantEdit(false);
    setManualMode(false);
    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.8,
      });

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const payload = {
        screenshot: `data:image/jpeg;base64,${base64}`,
        date: paymentDate || new Date().toISOString().split("T")[0],
        income: isNaN(income) ? 0 : income,
        income_name: employer || manualEmployer || "Unknown",
        frequency: frequency || "One-time",
      };


      const response = await fetch(`${API_BASE_URL}/save-earning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
     });

    // 🪵 Log full raw response (this helps debug what's going wrong)
      const text = await response.text();
      console.log(" Raw response text:", text);

      try {
       const result = JSON.parse(text);
       console.log('Upload result:', result);
     } catch (parseError) {
       console.error('JSON parse error:', parseError);
     }


      setManualEmployer('');
      setPaymentDate('');
      setEmployer('');
      setIncome('');
      setFrequency('');
    } catch (err) {
      console.error('Screenshot/upload failed', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
    <KeyboardAwareScrollView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        ref={viewRef}
      >
        <TouchableOpacity onPress={handleChooseSource} style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 6, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="camera" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ color: '#fff', fontSize: 16 }}>Scan your Pay Slip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setManualMode(true)} style={{ backgroundColor: '#34A853', padding: 12, borderRadius: 6, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="pencil" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ color: '#fff', fontSize: 16 }}>Enter income manually</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={{ height: 500, marginVertical: 20 }} />}

        {manualMode && (
          <View>
            <TextInput
              placeholder="Employer Name"
              placeholderTextColor={theme.textColor}
              value={manualEmployer}
              onChangeText={setManualEmployer}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />
            <TextInput
              placeholder="Net Income"
              placeholderTextColor={theme.textColor}
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />
            <TextInput
              placeholder="Payment Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textColor}
              value={paymentDate}
              onChangeText={setPaymentDate}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />
            <TextInput
              placeholder="Frequency"
              placeholderTextColor={theme.textColor}
              value={frequency}
              onChangeText={handleTypeChange}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />

            {filteredSuggestions.length > 0 && (
              <ScrollView style={{ borderWidth: 1, borderColor: '#ccc', maxHeight: 150 }}>
                {filteredSuggestions.map((item) => (
                  <TouchableOpacity key={item} onPress={() => handleSelectSuggestion(item)}>
                    <Text style={{ padding: 10, backgroundColor: '#f0f0f0', borderBottomWidth: 1 , borderBlockColor: theme.textColor, color: theme.textColor}}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity onPress={handleScreenshotAndUpload} style={{ backgroundColor: 'green', padding: 12, borderRadius: 6, alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Income Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setManualMode(false)} style={{ backgroundColor: 'red', padding: 12, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {!manualMode && usedCamera && wantToEdit && (
          <View>
            <TextInput
              placeholder="Employer Name" 
              placeholderTextColor={theme.textColor}
              value={employer}
              onChangeText={setEmployer}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor }}
            />
            <TextInput
              placeholder="Net Income"
              placeholderTextColor={theme.textColor}
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />
            <TextInput
              placeholder="Payment Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textColor}
              value={paymentDate}
              onChangeText={setPaymentDate}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />
            <TextInput
              placeholder="Frequency"
              placeholderTextColor={theme.textColor}
              value={frequency}
              onChangeText={handleTypeChange}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 , borderBlockColor: theme.textColor, color: theme.textColor}}
            />

            {filteredSuggestions.length > 0 && (
              <ScrollView style={{ borderWidth: 1, borderColor: '#ccc', maxHeight: 150 }}>
                {filteredSuggestions.map((item) => (
                  <TouchableOpacity key={item} onPress={() => handleSelectSuggestion(item)}>
                    <Text style={{ padding: 10, backgroundColor: '#f0f0f0', borderBottomWidth: 1 }}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={handleScreenshotAndUpload}
              style={{ backgroundColor: 'green', padding: 12, borderRadius: 6, alignItems: 'center', marginVertical: 20 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Income Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setWantEdit(false);
                setEmployer('');
                setIncome('');
                setPaymentDate('');
                setFrequency('');
                setImageUri(null);
              }}
              style={{ backgroundColor: 'red', padding: 12, borderRadius: 6, alignItems: 'center' }}
            >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomTabs></BottomTabs>
    </KeyboardAwareScrollView>

    </View>
    
  );
}
