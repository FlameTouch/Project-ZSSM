import api from '../config/api';

export const exchangeService = {
  async getCurrentRates(currencies = ['USD', 'EUR', 'GBP', 'CHF']) {
    try {
      // api.get(endpoint, params) where params is an object turned into query string
      const response = await api.get('/exchange/rates/current', {
        currencies: currencies.join(','),
      });
      return response.data.rates;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch rates' };
    }
  },

  async getHistoricalRate(currency, date) {
    try {
      const response = await api.get(`/exchange/rates/historical/${currency}`, { date });
      return response.data.rate;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch historical rate' };
    }
  },

  async getRatesInRange(currency, startDate, endDate) {
    try {
      const response = await api.get(`/exchange/rates/historical/${currency}`, { startDate, endDate });
      return response.data.rates;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch rates range' };
    }
  },

  async getAvailableCurrencies() {
    try {
      const response = await api.get('/exchange/currencies');
      return response.data.currencies;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch currencies' };
    }
  },

  async buyCurrency(fromCurrency, toCurrency, amount) {
    try {
      const response = await api.post('/exchange/buy', {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Transaction failed' };
    }
  },

  async sellCurrency(fromCurrency, toCurrency, amount) {
    try {
      const response = await api.post('/exchange/sell', {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Transaction failed' };
    }
  },

  async topUpAccount(currency, amount) {
    try {
      const response = await api.post('/exchange/topup', {
        currency,
        amount: parseFloat(amount),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Top up failed' };
    }
  },

  async getWallet() {
    try {
      const response = await api.get('/exchange/wallet');
      return response.data.wallet;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch wallet' };
    }
  },

  async getTransactionHistory(limit = 50, offset = 0) {
    try {
      const response = await api.get('/exchange/transactions', { limit, offset });
      return response.data.transactions;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch transactions' };
    }
  },
};
