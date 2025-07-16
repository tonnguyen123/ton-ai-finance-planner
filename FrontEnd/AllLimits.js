import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { API_BASE_URL } from '@env';
import axios from 'axios';



export default function AllLimits () {
    const [limits, setLimits] = useState([]);

    const fetchLimits = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-limits`);
      setLimits(res.data);
      console.log("Limits: ", res.data);
    } catch (err) {
      console.error("Failed to fetch limits", err);
    }
  };

     useEffect(() => {
    fetchLimits();
  }, []);

    return (
        <View>
            <Text>
                test
            </Text>
        </View>
    )
}