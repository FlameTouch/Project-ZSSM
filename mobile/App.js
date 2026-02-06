import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from './services/authService';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RatesScreen from './screens/RatesScreen';
import ExchangeScreen from './screens/ExchangeScreen';
import WalletScreen from './screens/WalletScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Rates':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Exchange':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            default:
              iconName = focused ? 'ellipse' : 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
      })}
    >
      <Tab.Screen
        name="Rates"
        component={RatesScreen}
        options={{ title: 'Exchange Rates' }}
      />
      <Tab.Screen
        name="Exchange"
        component={ExchangeScreen}
        options={{ title: 'Exchange' }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setLoading(false);
    
    // Navigate to appropriate screen based on auth status
    if (navigationRef.current) {
      if (authenticated) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  if (loading) {
    return null; 
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    padding: 5,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
});
