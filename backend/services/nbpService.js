const axios = require('axios');

const NBP_API_URL = process.env.NBP_API_URL || 'https://api.nbp.pl/api';

class NBPService {
  /**
   * Get current exchange rate for a currency
   * @param {string} currencyCode - Currency code (e.g., 'USD', 'EUR')
   * @returns {Promise<Object>} Exchange rate data
   */
  async getCurrentRate(currencyCode) {
    // PLN is the base currency, NBP API doesn't provide rates for it
    if (currencyCode === 'PLN') {
      return {
        currency: 'PLN',
        rate: 1.0,
        date: new Date().toISOString().split('T')[0],
        table: 'A',
        number: 'N/A'
      };
    }

    try {
      const response = await axios.get(
        `${NBP_API_URL}/exchangerates/rates/a/${currencyCode}/?format=json`
      );
      
      const rate = response.data.rates[0];
      return {
        currency: currencyCode,
        rate: rate.mid,
        date: rate.effectiveDate,
        table: response.data.table,
        number: response.data.no
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Currency ${currencyCode} not found`);
      }
      throw error;
    }
  }

  /**
   * Get exchange rates for multiple currencies
   * @param {Array<string>} currencyCodes - Array of currency codes
   * @returns {Promise<Array>} Array of exchange rates
   */
  async getMultipleRates(currencyCodes) {
    const promises = currencyCodes.map(code => 
      this.getCurrentRate(code).catch(err => {
        console.error(`Error fetching rate for ${code}:`, err.message);
        return null;
      })
    );
    
    const results = await Promise.all(promises);
    return results.filter(rate => rate !== null);
  }

  /**
   * Get historical exchange rate for a specific date
   * @param {string} currencyCode - Currency code
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Historical exchange rate
   */
  async getHistoricalRate(currencyCode, date) {
    // PLN is the base currency, NBP API doesn't provide rates for it
    if (currencyCode === 'PLN') {
      return {
        currency: 'PLN',
        rate: 1.0,
        date: date,
        table: 'A',
        number: 'N/A'
      };
    }

    try {
      const response = await axios.get(
        `${NBP_API_URL}/exchangerates/rates/a/${currencyCode}/${date}/?format=json`
      );
      
      const rate = response.data.rates[0];
      return {
        currency: currencyCode,
        rate: rate.mid,
        date: rate.effectiveDate,
        table: response.data.table,
        number: response.data.no
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Rate for ${currencyCode} on ${date} not found`);
      }
      throw error;
    }
  }

  /**
   * Get exchange rates for a date range
   * @param {string} currencyCode - Currency code
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of historical rates
   */
  async getRatesInRange(currencyCode, startDate, endDate) {
    // PLN is the base currency, NBP API doesn't provide rates for it
    if (currencyCode === 'PLN') {
      // Return a single rate entry for PLN
      return [{
        currency: 'PLN',
        rate: 1.0,
        date: endDate
      }];
    }

    try {
      const response = await axios.get(
        `${NBP_API_URL}/exchangerates/rates/a/${currencyCode}/${startDate}/${endDate}/?format=json`
      );
      
      return response.data.rates.map(rate => ({
        currency: currencyCode,
        rate: rate.mid,
        date: rate.effectiveDate
      }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Rates for ${currencyCode} in range ${startDate}-${endDate} not found`);
      }
      throw error;
    }
  }

  /**
   * Get list of available currencies from NBP
   * @returns {Promise<Array>} List of available currencies
   */
  async getAvailableCurrencies() {
    try {
      const response = await axios.get(
        `${NBP_API_URL}/exchangerates/tables/a/?format=json`
      );
      
      if (response.data && response.data[0] && response.data[0].rates) {
        return response.data[0].rates.map(rate => ({
          code: rate.code,
          name: rate.currency,
          rate: rate.mid
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching available currencies:', error);
      return [];
    }
  }
}

module.exports = new NBPService();
