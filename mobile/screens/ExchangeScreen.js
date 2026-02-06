import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { exchangeService } from '../services/exchangeService';

export default function ExchangeScreen() {
  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [currencies, setCurrencies] = useState(['PLN', 'USD', 'EUR', 'GBP', 'CHF']);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({});
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const data = await exchangeService.getCurrentRates(['USD', 'EUR', 'GBP', 'CHF']);
      const ratesMap = {};
      data.forEach(rate => {
        ratesMap[rate.currency] = rate.rate;
      });
      setRates(ratesMap);
    } catch (error) {
      console.error('Error loading rates:', error);
    }
  };

  const handleExchange = async (type) => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert('Error', 'Please select different currencies');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (type === 'buy') {
        result = await exchangeService.buyCurrency(fromCurrency, toCurrency, amount);
      } else {
        result = await exchangeService.sellCurrency(fromCurrency, toCurrency, amount);
      }

      console.log('Transaction result:', JSON.stringify(result, null, 2));

      // Safely extract transaction data
      const transaction = result.transaction || result;
      
      if (!transaction) {
        throw new Error('Invalid transaction response');
      }

      const toAmount = parseFloat(transaction.to_amount || transaction.toAmount || 0);
      const commission = parseFloat(transaction.commission || 0);
      const exchangeRate = parseFloat(transaction.exchange_rate || transaction.exchangeRate || 0);

      if (isNaN(toAmount) || toAmount === 0) {
        throw new Error('Invalid transaction amount');
      }

      Alert.alert(
        'Success',
        `Transaction completed!\n${parseFloat(amount).toFixed(2)} ${fromCurrency} → ${toAmount.toFixed(2)} ${toCurrency}\nCommission: ${commission.toFixed(2)} ${toCurrency}${exchangeRate > 0 ? `\nRate: ${exchangeRate.toFixed(4)}` : ''}`
      );
      setAmount('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Transaction failed';
      Alert.alert('Error', errorMessage);
      console.error('Exchange error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Currency Exchange</Text>

      <View style={styles.form}>
        <Text style={styles.label}>From Currency</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.pickerText}>{fromCurrency}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>To Currency</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.pickerText}>{toCurrency}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyButton]}
            onPress={() => handleExchange('buy')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Buy {toCurrency}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sellButton]}
            onPress={() => handleExchange('sell')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sell {fromCurrency}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Currency Picker Modals */}
      <Modal
        visible={showFromPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFromPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select From Currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFromCurrency(item);
                    setShowFromPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFromPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showToPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowToPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select To Currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setToCurrency(item);
                    setShowToPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowToPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#3498db',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#27ae60',
  },
  sellButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
