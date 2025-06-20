import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {styles} from '../styles/mainPage'
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
    const navigation = useNavigation();

  return (
    <View style = {styles.container}>
      <View style = {styles.title}>
        <Text style={{ fontSize: 22, color: 'black' }}>Ton's AI Financial Management App</Text>

      </View>
      
      <View style = {styles.buttonGroup}>
        <TouchableOpacity style = {styles.buttonSpacing} onPress={() => navigation.navigate("Expenses")}>
          <Text style={{marginBottom:10}}>Scan Receipt AI</Text>
        <FontAwesome5 name="money-check-alt" size={24} color="black"/></TouchableOpacity>

        <TouchableOpacity style = {styles.docButton} onPress={() => navigation.navigate("AllExpenses")}>
          <Text style={{marginBottom:10}}>All Expenses</Text> 
        <FontAwesome5 name="file-alt" size={24} color="white" /></TouchableOpacity>

        <TouchableOpacity style = {styles.emailbutton}>
          <Text style={{marginBottom:10}}>AI Finance Planner</Text>
        <FontAwesome5 name="envelope-open-text" size={24} color="white" /></TouchableOpacity>

        <TouchableOpacity style = {styles.notesButton}>
          <Text style={{marginBottom:10}}>Notes by voice</Text>
       <FontAwesome5 name="sticky-note" size={24} color="black"/></TouchableOpacity>
       
        


      </View>
      
    </View>
  );
}


