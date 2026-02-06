import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { exchangeService } from '../services/exchangeService';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadTransactions = async () => {
    try {
      setErrorMessage(null);
      const data = await exchangeService.getTransactionHistory();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      const msg =
        error?.error ||
        error?.response?.data?.error ||
        (typeof error === 'string' ? error : null) ||
        'Failed to load transactions';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'BUY':
        return '#27ae60';
      case 'SELL':
        return '#e74c3c';
      case 'TOPUP':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={[styles.transactionType, { color: getTransactionTypeColor(item.transaction_type) }]}>
          {item.transaction_type}
        </Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
      
      {item.transaction_type === 'TOPUP' ? (
        <View style={styles.transactionDetails}>
          <Text style={styles.amount}>+{parseFloat(item.to_amount).toFixed(2)} {item.to_currency}</Text>
        </View>
      ) : (
        <View style={styles.transactionDetails}>
          <Text style={styles.amount}>
            {parseFloat(item.from_amount).toFixed(2)} {item.from_currency} → {parseFloat(item.to_amount).toFixed(2)} {item.to_currency}
          </Text>
          <Text style={styles.rate}>Rate: {parseFloat(item.exchange_rate).toFixed(4)}</Text>
          {item.commission > 0 && (
            <Text style={styles.commission}>Commission: {parseFloat(item.commission).toFixed(2)}</Text>
          )}
        </View>
      )}
      
      <Text style={[styles.status, { color: item.status === 'COMPLETED' ? '#27ae60' : '#e74c3c' }]}>
        {item.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading transaction history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>

      {!!errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
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
  list: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  transactionDetails: {
    marginBottom: 10,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  rate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  commission: {
    fontSize: 12,
    color: '#e74c3c',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  errorContainer: {
    backgroundColor: '#fdecea',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#b00020',
    fontSize: 14,
  },
});
