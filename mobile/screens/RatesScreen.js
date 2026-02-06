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

export default function RatesScreen() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRates = async () => {
    try {
      const data = await exchangeService.getCurrentRates();
      setRates(data);
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRates();
  };

  const renderRateItem = ({ item }) => (
    <View style={styles.rateCard}>
      <View style={styles.rateHeader}>
        <Text style={styles.currencyCode}>{item.currency}</Text>
        <Text style={styles.rateValue}>{item.rate?.toFixed(4)} PLN</Text>
      </View>
      <Text style={styles.date}>Date: {item.date}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading exchange rates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Exchange Rates</Text>
      <Text style={styles.subtitle}>Source: National Bank of Poland (NBP)</Text>

      <FlatList
        data={rates}
        renderItem={renderRateItem}
        keyExtractor={(item, index) => `${item.currency}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
      />
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
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  rateCard: {
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
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  currencyCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  rateValue: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
});
