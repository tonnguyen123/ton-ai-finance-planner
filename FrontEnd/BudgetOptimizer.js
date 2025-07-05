import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';



export default function BudgetOptimizer () {
    useEffect (()=>{
        const loadDat = async () => {
            const storedTotalExpenses = await AsyncStorage.getItem('monthlyTotalExpenses');
            const storedExpenseTypes  = await AsyncStorage.getItem('monthlyTypeTotals');

            if(storedTotalExpenses && storedExpenseTypes) {
                const typeTotals = JSON.parse(storedExpenseTypes);
                const totalExpense = parseFloat(storedTotalExpenses);

                console.log('Type Totals:', typeTotals);
                console.log('Monthly Total:', totalExpense);
            }
        };
        loadDat();
        
    }), [];
}