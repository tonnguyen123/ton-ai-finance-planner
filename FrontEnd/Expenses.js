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
import {  useState, useRef } from 'react';
import { TextInput as PaperInput } from 'react-native-paper';
import { API_BASE_URL, MINDEE_API } from '@env';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { useTheme } from './styles/useTheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BottomTabs from './BottomTab';


export default function Expenses() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);   //List of all information of the receipt
  const [imageUri, setImageUri] = useState(null);  //The path containing the picture of the receipt
  const [totalPrice, setTotalPrice] = useState('');  //The total price of the receipt
  const [usedCamera, setUsedCamera] = useState(false);  //Check if user wants to use Camera to take picture or not
  const [storeAddr, setStoreAddr] = useState('');    //Store's addr on receipt
  const [purchaseTime, setPurchaseTime] = useState('');  //Purchase Time on receipt
  const [wantToEdit, setWantEdit] = useState(false);   //Check if user wants to edit extracted information
  const [purchaseDate, setPurchaseDate] = useState(''); //Purchase date on receipt
  const [store, setStore] = useState('');

  const [manualStore, setManualStore] = useState('');  //Check if user enters store manually for receipt's info

  const [manualMode, setManualMode] = useState(false); //Check if user wants to enter receipt's info manually


  const [receiptType, setReceiptType] = useState('');  //Types of receipts for different purposes in life
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const receiptTypeOptions = [
    'Groceries',
    'Gas',
    'Insurance',
    'Rent',
    'Car Insurance',
    'Health Insurance',
    'Date',
    'Cloth',
    'Shopping',
    'Eat out',
  ];


  const viewRef = useRef(null);

  //Filter the receipt type based on user's input
  const handleTypeChange = (text) => {
  setReceiptType(text);
  if (text.length > 0) {
    const filtered = receiptTypeOptions.filter(option =>
      option.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  } else {
    setFilteredSuggestions([]);
  }
};

const handleSelectSuggestion = (suggestion) => {
  setReceiptType(suggestion);
  setFilteredSuggestions([]);
};


  const handleChooseSource = () => {
    setManualMode(false);
  Alert.alert(
    'Upload Receipt',
    'Choose how you want to add your receipt:',
    [
      {
        text: 'Camera',
        onPress: () => pickFromCamera(),
      },
      {
        text: 'Photo Library',
        onPress: () => pickFromLibrary(),
      },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
  };

  //Camera Picker
  const pickFromCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Camera permission is required');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    base64: false,
    quality: 1,
    allowsEditing: false,
  });

  if (!result.canceled && result.assets?.length > 0) {
    processPickedImage(result.assets[0].uri);
  }
  };


  // Photo picker
const pickFromLibrary = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access photo library is required');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    base64: false,
    quality: 1,
    allowsEditing: false,
  });

  if (!result.canceled && result.assets?.length > 0) {
    processPickedImage(result.assets[0].uri);
  }
};

// Common logic after selecting image from camera or gallery
const processPickedImage = async (uri) => {
  setImageUri(uri);

  const formData = new FormData();
  formData.append('document', {
    uri: uri,
    type: 'image/jpeg',
    name: 'receipt.jpg',
  });

  try {
    const response = await fetch(
      'https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${MINDEE_API}`,
        },
        body: formData,
      }
    );

    const json = await response.json();
    const prediction = json.document.inference.prediction;

    const date = prediction.date?.value || '';
    const time = prediction.time?.value || '';
    const total = prediction.total_amount?.value || '';
    const store_addr = prediction.supplier_address?.value || 'No address found';
    const store_name = prediction.supplier_name?.value || '';

    const lineItems =
      prediction.line_items?.map((item) => ({
        item: item.description || 'Unknown',
        price: item.total_amount || 0,
      })) || [];

    setTotalPrice(total);
    setPurchaseTime(time);
    setStoreAddr(store_addr);
    setPurchaseDate(date);
    setStore(store_name);
    setItems(lineItems);
    setUsedCamera(true);
    setWantEdit(true);
  } catch (error) {
    console.error(' Upload failed:', error);
    setUsedCamera(false);
  }
};


  //
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
        date: purchaseDate,
        total_price: parseFloat(totalPrice),
        receipt_type: receiptType || 'Other',
      };

      console.log("Sent data's info is " + payload.date + " " + payload.total_price) ;

      const response = await fetch(`${API_BASE_URL}/save-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Upload result:', result);
      setManualStore('');
      setPurchaseDate('');
      setStore('');
      setReceiptType('');
      
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
        contentContainerStyle={{ padding: 20 , backgroundColor: theme.background, flex:1}}
        keyboardShouldPersistTaps="handled"
        ref={viewRef} 
      >
        <View collapsable={false}>
          <TouchableOpacity
            onPress={handleChooseSource}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#007AFF',
              padding: 12,
              borderRadius: 6,
              marginBottom: 15,
            }}
          >
        <FontAwesome name="camera" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={{ color: '#fff', fontSize: 16 }}> Scan picture of your Rece ipt or Earning</Text>
        </TouchableOpacity>

        {/* Manual entry button */}
        <TouchableOpacity
          onPress={() => setManualMode(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#34A853',
            padding: 12,
            borderRadius: 6,
            marginBottom: 20,
          }}
        >
          <FontAwesome name="pencil" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ color: theme.textColor, fontSize: 16 }}>Enter receipt or earning manually</Text>
        </TouchableOpacity>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ height: 500, marginVertical: 20 }}
            />
          )}


          {manualMode && (
          <View style={{ marginBottom: 20 , backgroundColor:theme.background}}>
            <TextInput
              placeholder="Store Name"
              value={manualStore}
              onChangeText={setManualStore}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10, borderBlockColor: theme.textColor, color: theme.textColor }}
            />
            <TextInput
              placeholder="Total Price"
              value={totalPrice}
              onChangeText={setTotalPrice}
              keyboardType="numeric"
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Purchase Date (YYYY-MM-DD)"
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Receipt Type"
              value={receiptType}
              onChangeText={setReceiptType}
              style={{ borderBottomWidth: 1, fontSize: 16, marginBottom: 10 }}
            />

            <TouchableOpacity
                onPress={handleScreenshotAndUpload}
                style={{
                  backgroundColor: 'green',
                  padding: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  Save Manually Entered Receipt
                </Text>
              </TouchableOpacity>
            {manualMode && (
            <TouchableOpacity onPress={() => setManualMode(false)} style={{
                  backgroundColor: 'red',
                  padding: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          )}
          </View>
        )}


          {wantToEdit ? (
            <View>
              <TextInput
                value={store}
                onChangeText={setStore}
                placeholder="Store Name"
                style={{ fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
              />
              <TextInput
                value={storeAddr}
                onChangeText={setStoreAddr}
                placeholder="Store Address"
                style={{ fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor }}
              />

              {items.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    value={item.item}
                    onChangeText={(text) => {
                      const updated = [...items];
                      updated[idx].item = text;
                      setItems(updated);
                    }}
                    placeholder="Item"
                    style={{ flex: 1, borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
                  />
                  <TextInput
                    value={item.price.toString()}
                    onChangeText={(text) => {
                      const updated = [...items];
                      updated[idx].price = parseFloat(text) || 0;
                      setItems(updated);
                    }}
                    placeholder="Price"
                    keyboardType="numeric"
                    style={{ width: 80, borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
                  />
                </View>
              ))}

              <TextInput
                value={totalPrice.toString()}
                onChangeText={setTotalPrice}
                placeholder="Total Price"
                keyboardType="numeric"
                style={{ fontSize: 16, borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
              />
              <TextInput
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="Purchase Date (YYYY-MM-DD)"
                style={{ borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
              />
              <TextInput
                value={purchaseTime}
                onChangeText={setPurchaseTime}
                placeholder="Purchase Time(HH:MM)"
                style={{ borderBottomWidth: 1 , borderColor: theme.textColor, color: theme.textColor}}
              />
              <PaperInput
              label="Receipt Type"
              value={receiptType}
              onChangeText={handleTypeChange}
              mode="outlined"
              style={{ marginVertical: 10 , borderColor: theme.textColor, color: theme.textColor }}
            />

            {/* Dropdown Suggestions */}
            {filteredSuggestions.length > 0  &&(
              <ScrollView
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  maxHeight: 150,
                  marginBottom: 10,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {filteredSuggestions.map((item) => (
                  <TouchableOpacity key={item} onPress={() => handleSelectSuggestion(item)}>
                    <Text style={{
                      padding: 10,
                      backgroundColor: '#f0f0f0',
                      borderBottomWidth: 1,
                      borderColor: '#ccc'
                    }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}


            <Button title="Done Editing" onPress={() => handleScreenshotAndUpload()} />

            </View>
          ) : (
            <View>
              
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{store}</Text>

  
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{store}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{storeAddr}</Text>

              {items.length > 0 && (
                <>
                  <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Expenses:</Text>
                  {items.map((item, idx) => (
                    <Text key={idx}>
                      {item.item}: ${item.price}
                    </Text>
                  ))}
                </>
              )}

              {usedCamera && (
                <View>
                  <Text>Total Price: {totalPrice}</Text>
                  <Text>
                    Purchase time: {purchaseDate} {purchaseTime}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <BottomTabs></BottomTabs>
    </KeyboardAwareScrollView>

      </View>
    
  );
}
