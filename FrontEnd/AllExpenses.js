import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, FlatList, TouchableOpacity, ScrollView, Image, Pressable,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import ImageViewer from 'react-native-image-zoom-viewer';

// Month names for selection dropdown
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AllExpenses() {
  // All expenses fetched from backend
  const [allExpense, setAllExpense] = useState([]);

  // Filtered expenses after clicking "Show Receipts"
  const [filteredExpense, setFilteredExpense] = useState([]);

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

  // Fetch expenses + setup year dropdown
  useEffect(() => {
    fetchSavedExpenses();

    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 11 }, (_, i) => currentYear - i);
    setYears(pastYears);
  }, []);

  // Fetch all expense data from Flask backend
  const fetchSavedExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-expenses`);
      setAllExpense(response.data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Open zoomable image modal
  const openImage = (url) => {
    setSelectedImageUrl([{ url }]);
    setModalVisible(true);
  };

  // When "Show Receipts" button is clicked, filter expenses
  const handleShowReceipts = () => {
    const month = selectedMonth + 1; // months are 0-indexed

    const filtered = allExpense.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === selectedYear &&
        expDate.getMonth() + 1 === month
      );
    });

    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredExpense(sorted);
    setHasFiltered(true); // Mark that user clicked the button
  };

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

      {/* ===== Button: Show Receipts ===== */}
      <TouchableOpacity
        onPress={handleShowReceipts}
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
        {hasFiltered && filteredExpense.length === 0 ? (
          <Text style={{ fontStyle: 'italic', marginTop: 20 }}>
            There is no record of any receipt for the chosen time.
          </Text>
        ) : (
          filteredExpense.map((exp, idx) => (
            <View key={idx} style={{ marginBottom: 20 }}>
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
          ))
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
