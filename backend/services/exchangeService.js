const pool = require('../config/database');
const nbpService = require('./nbpService');

class ExchangeService {
  // Commission rate (0.5%)
  COMMISSION_RATE = 0.005;

  /**
   * Calculate exchange with commission
   */
  calculateExchange(fromAmount, fromRate, toRate) {
    // Convert to PLN first, then to target currency
    const plnAmount = fromAmount * fromRate;
    const toAmount = plnAmount / toRate;
    const commission = toAmount * this.COMMISSION_RATE;
    const finalAmount = toAmount - commission;
    
    return {
      fromAmount,
      toAmount: finalAmount,
      commission,
      exchangeRate: toRate / fromRate
    };
  }

  /**
   * Get or fetch exchange rate (with caching)
   */
  async getExchangeRate(currencyCode, date = null) {
    // PLN is the base currency, always has rate of 1.0
    if (currencyCode === 'PLN') {
      return {
        currency_code: 'PLN',
        rate: 1.0,
        date: date || new Date().toISOString().split('T')[0]
      };
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Check cache first
    const cached = await pool.query(
      'SELECT * FROM exchange_rates WHERE currency_code = $1 AND date = $2',
      [currencyCode, targetDate]
    );

    if (cached.rows.length > 0) {
      return cached.rows[0];
    }

    // Fetch from NBP API
    let rateData;
    try {
      if (date) {
        rateData = await nbpService.getHistoricalRate(currencyCode, date);
      } else {
        rateData = await nbpService.getCurrentRate(currencyCode);
      }
    } catch (error) {
      throw new Error(`Currency ${currencyCode} not found`);
    }

    // Cache the rate
    await pool.query(
      `INSERT INTO exchange_rates (currency_code, rate, date, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (currency_code, date) DO UPDATE SET rate = $2`,
      [currencyCode, rateData.rate, rateData.date, 'NBP']
    );

    return {
      currency_code: currencyCode,
      rate: rateData.rate,
      date: rateData.date
    };
  }

  /**
   * Execute buy transaction
   */
  async buyCurrency(userId, fromCurrency, toCurrency, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get exchange rates
      const fromRate = await this.getExchangeRate(fromCurrency);
      const toRate = await this.getExchangeRate(toCurrency);

      // Calculate exchange
      const calculation = this.calculateExchange(
        amount,
        fromRate.rate,
        toRate.rate
      );

      // Check if user has enough balance
      const walletCheck = await client.query(
        'SELECT amount FROM currency_wallet WHERE user_id = $1 AND currency_code = $2',
        [userId, fromCurrency]
      );

      const currentBalance = walletCheck.rows[0]?.amount || 0;
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update wallet - subtract from currency
      await client.query(
        `INSERT INTO currency_wallet (user_id, currency_code, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, currency_code)
         DO UPDATE SET amount = currency_wallet.amount - $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, fromCurrency, amount]
      );

      // Update wallet - add to currency
      await client.query(
        `INSERT INTO currency_wallet (user_id, currency_code, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, currency_code)
         DO UPDATE SET amount = currency_wallet.amount + $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, toCurrency, calculation.toAmount]
      );

      // Record transaction
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (user_id, transaction_type, from_currency, to_currency, from_amount, to_amount, exchange_rate, commission)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          userId,
          'BUY',
          fromCurrency,
          toCurrency,
          amount,
          calculation.toAmount,
          calculation.exchangeRate,
          calculation.commission
        ]
      );

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute sell transaction
   */
  async sellCurrency(userId, fromCurrency, toCurrency, amount) {
    // Sell is essentially the same as buy, just reversed
    return this.buyCurrency(userId, fromCurrency, toCurrency, amount);
  }

  /**
   * Top up account (virtual transfer)
   */
  async topUpAccount(userId, currency, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Add to wallet
      await client.query(
        `INSERT INTO currency_wallet (user_id, currency_code, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, currency_code)
         DO UPDATE SET amount = currency_wallet.amount + $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, currency, amount]
      );

      // Record transaction
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (user_id, transaction_type, from_currency, to_currency, from_amount, to_amount)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, 'TOPUP', null, currency, null, amount]
      );

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ExchangeService();
