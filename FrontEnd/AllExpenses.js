import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView, Image, Pressable, FlatList, Dimensions, Alert
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import ImageViewer from 'react-native-image-zoom-viewer';
import { FontAwesome } from '@expo/vector-icons';

import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Month names for selection dropdown
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

//Get the width and length of the phone screen
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function AllExpenses() {
  // All expenses fetched from backend
  const [allExpense, setAllExpense] = useState([]);

  // Filtered expenses after clicking "Show Receipts"
  const [filteredExpense, setFilteredExpense] = useState([]);
  const [filteredEarnings, setFilteredEarning] = useState([]);
  const [wantToEdit, setWantEdit] = useState(false);   //Check if user wants to edit extracted information

  // Track month and year selected by user
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // List of years to show in picker
  const [years, setYears] = useState([]);

  // Image modal (zoom view)
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // Booleans to control dropdown modals
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  // Track if user has attempted to filter yet (to avoid showing message too early)
  const [hasFiltered, setHasFiltered] = useState(false);

  //Total sepnt expenses of the chosen month and year 
  const [monthExpenses, setMonthExpenses] = useState(0);

  //Total spent expense for all specific type of all receipts
  const [typeTotals, setTypeTotals] = useState({});

  // All fields that can be editted in the receipt
  const [editedDate,setPurchaseDate] = useState('');  
  const [editedPrice,setPrice] = useState('');
  const [editeType,setType] = useState('');
  const [editId, setEditId] = useState(null);


  //Filters for user to choose what type of data that user wants to search
  const [filterOption, setFilterOption] = useState('Expenses'); // Default to Expenses
  const [earningsData, setEarningsData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);



  // Fetch expenses + earnings year dropdown
  useEffect(() => {
    fetchSavedExpenses();
    fetchEarnings();
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 11 }, (_, i) => currentYear - i);
    setYears(pastYears);
  }, []);


    //This function is to store expenses and earnings into local storage for usage
   const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);

    const storedValue = await AsyncStorage.getItem(key);

    if (storedValue) {
      const data = JSON.parse(storedValue);

      if (data.expenses && Array.isArray(data.expenses)) {
        data.expenses.forEach((item, index) => {
          console.log(`Price ${index + 1}: `, item.total_price);
        });
      } else {
        console.log('No expenses found in data');
      }

      console.log(key + " " + storedValue);
    } else {
      console.log('No data found for key:', key);
    }
  } catch (e) {
    console.error('Saving error:', e);
  }
};





    //Fetch all earnings from the database
    const fetchEarnings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-earnings`);
      
      const savedEarnings = JSON.stringify(res.data);
      storeData('Earnings',savedEarnings);

      console.log("API full response for Earnings:", savedEarnings);
      const earnings = res.data.earnings || [];
      setEarningsData(earnings);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  };




  // Fetch all expense data from Flask backend
  const fetchSavedExpenses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-expenses`);
    
    
    const savedExpenses = response.data;
    storeData('Expenses', savedExpenses);

    console.log("API full response for expenses:", savedExpenses);

    let expenses = [];

    if (Array.isArray(response.data)) {
      expenses = response.data;
    } else if (response.data && Array.isArray(response.data.expenses)) {
      expenses = response.data.expenses;
    }

    setAllExpense(expenses);
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};



  // Open zoomable image modal
  const openImage = (url) => {
    setSelectedImageUrl([{ url }]);
    setModalVisible(true);
  };

  // When "Show Receipts" button is clicked, filter expenses
  const handleShowReceipts = async (data = allExpense, earnings = earningsData) => {
  const month = selectedMonth;


  if (filterOption === 'Expenses' || filterOption === 'All') {
    const filtered = data.filter((exp) => {
      const expDate = new Date(exp.date + 'T12:00:00');

      return (
        expDate.getFullYear() === selectedYear &&
        expDate.getMonth() === month

      );
    });

    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredExpense(sorted);
    const total = sorted.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const typeSum = {};

    sorted.forEach((item) => {
      if (!typeSum[item.receipt_type]) typeSum[item.receipt_type] = 0;
      typeSum[item.receipt_type] += parseFloat(item.total_price);
    });

    setMonthExpenses(total);
    setTypeTotals(typeSum);
    await AsyncStorage.setItem('monthlyTypeTotals', JSON.stringify(typeSum));
    await AsyncStorage.setItem('monthlyTotalExpenses', total.toString());
  }

  if (filterOption === 'Earnings' || filterOption === 'All') {
  console.log("Filtering earnings for year:", selectedYear, "month:", selectedMonth);

  const filtered = earnings.filter((e) => {
    const earnDate = new Date(e.date + 'T12:00:00');

    console.log("Checking date:", e.date, "=>", earnDate.toISOString(), "Month:", earnDate.getMonth(), "Year:", earnDate.getFullYear());

    return (
      earnDate.getFullYear() === selectedYear &&
      earnDate.getMonth() === selectedMonth
    );
  });

  console.log("Filtered earnings result:", filtered);

  const totalEarn = filtered.reduce((sum, e) => sum + parseFloat(e.income), 0);
  setTotalIncome(totalEarn);
  setFilteredEarning(filtered);
}


  setHasFiltered(true);
};


  // Save all manual change for extracted information from the user
  const handleSaveEdit = async(expenseID) =>{
    try {
      await axios.put(`${API_BASE_URL}/update-exp/${expenseID}`,{
        date: editedDate,
        total_price:editedPrice,
        receipt_type: editeType
      });

      const data = await fetchSavedExpenses();
      handleShowReceipts(data);
      setWantEdit(false);
      setEditId(null);
      Alert.alert('Updated the expense information successfully!')
      await fetchSavedExpenses();
    } catch (error) {
      console.log("error updateing expense: ", error);
      
    }
  }

  //Confirm with the user if they want to delete the chosen expense
  const confirmDelete = async(expenseID) => {
      console.log("deleted id: " + expenseID);

        Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteItem(expenseID),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );

    
  }

  //Delete the chosen expense if it was entered by mistake
  const handleDeleteItem = async(expenseID) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${expenseID}`);
       setWantEdit(false);
      const data = await fetchSavedExpenses();
      handleShowReceipts(data);
       setEditId(null);
    } catch (error) {
       console.log("error deleting expense: ", error);
    }
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>

      {/* ===== Dropdown: Month ===== */}
      <Text>Select Month:</Text>
      <TouchableOpacity
        onPress={() => setMonthPickerVisible(true)}
        style={{
          borderWidth: 1, borderColor: 'gray', padding: 10,
          borderRadius: 5, marginBottom: 10,
        }}
      >
        <Text>{months[selectedMonth]}</Text>
      </TouchableOpacity>

      {/* ===== Dropdown: Year ===== */}
      <Text>Select Year:</Text>
      <TouchableOpacity
        onPress={() => setYearPickerVisible(true)}
        style={{
          borderWidth: 1, borderColor: 'gray', padding: 10,
          borderRadius: 5, marginBottom: 10,
        }}
      >
        <Text>{selectedYear}</Text>
      </TouchableOpacity>

      <Text>Filter By:</Text>
        <View style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10 }}>
          {['All', 'Expenses', 'Earnings'].map(option => (
            <TouchableOpacity key={option} onPress={() => setFilterOption(option)} style={{ padding: 10, backgroundColor: filterOption === option ? '#007AFF' : '#fff' }}>
              <Text style={{ color: filterOption === option ? 'white' : 'black' }}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>


      {/* ===== Button: Show Receipts ===== */}
      <TouchableOpacity
        onPress={() => handleShowReceipts(allExpense, earningsData)}
        style={{
          marginTop: 10,
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Show Receipts</Text>
      </TouchableOpacity>

      {/* ===== ScrollView: Filtered Receipts OR Message ===== */}
      <ScrollView style={{ marginTop: 20 }}>
  {hasFiltered && (
    (filterOption === 'Expenses' && filteredExpense.length === 0) ||
    (filterOption === 'Earnings' && filteredEarnings.length === 0)
  ) ? (
    <Text style={{ fontStyle: 'italic', marginTop: 20 }}>
      There is no record of any {filterOption.toLowerCase()} for the chosen time.
    </Text>
  ) : (
    <>
      <View style={{ marginBottom: 20 }}>
        {filterOption === 'Expenses' && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              Total Monthly Expenses: ${monthExpenses.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
              Total by Receipt Type:
            </Text>
          </View>
        )}

        {filterOption === 'Earnings' && (
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            Total Monthly Earnings: ${totalIncome.toFixed(2)}
          </Text>
        )}

        {Object.entries(typeTotals).map(([type, amount], idx) => (
          <Text key={idx} style={{ marginLeft: 10 }}>
            {type}: ${amount.toFixed(2)}
          </Text>
        ))}
      </View>

      {/* 💡 NEW: Show filteredExpense and filteredEarnings in 'All' */}
      {filterOption === 'All' && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            Total Monthly Income: ${totalIncome.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
            Total Monthly Expenses: ${monthExpenses.toFixed(2)}
          </Text>
          {Object.entries(typeTotals).map(([type, amount], idx) => (
            <Text key={idx} style={{ marginLeft: 10 }}>
              {type}: ${amount.toFixed(2)}
            </Text>
          ))}
        </View>
      )}

      {(filterOption === 'Expenses' || filterOption === 'All') &&
        filteredExpense.map((exp, idx) => (
          <View key={idx} style={{ marginBottom: 20, borderRadius: 10, backgroundColor: "#3ee0f3", padding: 5 }}>
            <Text>Date: {exp.date}</Text>
            <Text>Total: ${exp.total_price}</Text>
            <Text>Type: {exp.receipt_type}</Text>
            <TouchableOpacity onPress={() => openImage(`${API_BASE_URL}/${exp.screenshot_path}`)}>
              <Image
                source={{ uri: `${API_BASE_URL}/${exp.screenshot_path}` }}
                style={{ width: 200, height: 300, marginTop: 10 }}
              />
            </TouchableOpacity>
          </View>
        ))}

      {(filterOption === 'Earnings' || filterOption === 'All') &&
        filteredEarnings.map((earn, idx) => (
          <View key={idx} style={{ marginBottom: 20, borderRadius: 10, backgroundColor: "#b3f3a3", padding: 5 }}>
            <Text>Date: {earn.date}</Text>
            <Text>Income: ${parseFloat(earn.income).toFixed(2)}</Text>
            <Text>Employer: {earn.income_name}</Text>
            <Text>Frequency: {earn.frequency}</Text>
            <TouchableOpacity onPress={() => openImage(`${API_BASE_URL}/${earn.screenshot_path}`)}>
              <Image
                source={{ uri: `${API_BASE_URL}/${earn.screenshot_path}` }}
                style={{ width: 200, height: 300, marginTop: 10 }}
              />
            </TouchableOpacity>
          </View>
        ))}
    </>
  )}
</ScrollView>


      {/* ===== Modal: Image Zoom Viewer ===== */}
      <Modal visible={isModalVisible} transparent>
        <ImageViewer
          imageUrls={selectedImageUrl || []}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          renderHeader={() => (
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
                position: 'absolute',
                top: 40,
                right: 20,
                zIndex: 999,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
                padding: 10,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>✕</Text>
            </Pressable>
          )}
        />
      </Modal>

      {/* ===== Modal: Month Picker List ===== */}
      <Modal visible={monthPickerVisible} transparent animationType="slide">
        <View style={{
          flex: 1, backgroundColor: 'white', padding: 20,
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Month</Text>
          <FlatList
            data={months}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMonth(index);
                  setMonthPickerVisible(false);
                }}
                style={{ padding: 10 }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* ===== Modal: Year Picker List ===== */}
      <Modal visible={yearPickerVisible} transparent animationType="slide">
        <View style={{
          flex: 1, backgroundColor: 'white', padding: 20,
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Year</Text>
          <FlatList
            data={years}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedYear(item);
                  setYearPickerVisible(false);
                }}
                style={{ padding: 10 }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
