import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { exchangeService } from '../services/exchangeService';

export default function WalletScreen() {
  const [wallet, setWallet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topUpCurrency, setTopUpCurrency] = useState('PLN');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const loadWallet = async () => {
    try {
      const data = await exchangeService.getWallet();
      setWallet(data);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setTopUpLoading(true);
    try {
      await exchangeService.topUpAccount(topUpCurrency, topUpAmount);
      Alert.alert('Success', `Account topped up with ${topUpAmount} ${topUpCurrency}`);
      setTopUpAmount('');
      loadWallet();
    } catch (error) {
      Alert.alert('Error', error.error || 'Top up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  const renderWalletItem = ({ item }) => (
    <View style={styles.walletCard}>
      <Text style={styles.currencyCode}>{item.currency_code}</Text>
      <Text style={styles.amount}>{parseFloat(item.amount).toFixed(2)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Wallet</Text>

      <View style={styles.topUpSection}>
        <Text style={styles.sectionTitle}>Top Up Account</Text>
        <View style={styles.topUpForm}>
          <View style={styles.currencyInput}>
            <TextInput
              style={styles.currencyCodeInput}
              value={topUpCurrency}
              onChangeText={setTopUpCurrency}
              placeholder="PLN"
              maxLength={3}
            />
          </View>
          <TextInput
            style={styles.amountInput}
            placeholder="Amount"
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={handleTopUp}
            disabled={topUpLoading}
          >
            {topUpLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.topUpButtonText}>Top Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Balances</Text>
      {wallet.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No balances yet</Text>
          <Text style={styles.emptySubtext}>Top up your account to get started</Text>
        </View>
      ) : (
        <FlatList
          data={wallet}
          renderItem={renderWalletItem}
          keyExtractor={(item) => item.currency_code}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  topUpSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  topUpForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyInput: {
    width: 60,
  },
  currencyCodeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  topUpButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  topUpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  walletCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  amount: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
});
