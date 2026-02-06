const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const exchangeService = require('../services/exchangeService');
const nbpService = require('../services/nbpService');
const pool = require('../config/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get current exchange rates
router.get('/rates/current', async (req, res) => {
  try {
    const { currencies } = req.query;
    const currencyList = currencies ? currencies.split(',') : ['USD', 'EUR', 'GBP', 'CHF'];
    
    const rates = await nbpService.getMultipleRates(currencyList);
    res.json({ rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Get historical exchange rate
router.get('/rates/historical/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const { date, startDate, endDate } = req.query;

    if (startDate && endDate) {
      // Get range of rates
      const rates = await nbpService.getRatesInRange(currency, startDate, endDate);
      res.json({ currency, rates });
    } else if (date) {
      // Get specific date
      const rate = await nbpService.getHistoricalRate(currency, date);
      res.json({ rate });
    } else {
      res.status(400).json({ error: 'Date or date range required' });
    }
  } catch (error) {
    console.error('Error fetching historical rate:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch historical rate' });
  }
});

// Get available currencies
router.get('/currencies', async (req, res) => {
  try {
    const currencies = await nbpService.getAvailableCurrencies();
    res.json({ currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Buy currency
router.post('/buy',
  [
    body('fromCurrency').isLength({ min: 3, max: 3 }).isUppercase(),
    body('toCurrency').isLength({ min: 3, max: 3 }).isUppercase(),
    body('amount').isFloat({ min: 0.01 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fromCurrency, toCurrency, amount } = req.body;
      const userId = req.user.userId;

      const transaction = await exchangeService.buyCurrency(
        userId,
        fromCurrency,
        toCurrency,
        amount
      );

      // Ensure numeric values are properly formatted
      const formattedTransaction = {
        ...transaction,
        from_amount: parseFloat(transaction.from_amount) || 0,
        to_amount: parseFloat(transaction.to_amount) || 0,
        exchange_rate: parseFloat(transaction.exchange_rate) || 0,
        commission: parseFloat(transaction.commission) || 0,
      };

      res.json({
        message: 'Transaction completed successfully',
        transaction: formattedTransaction
      });
    } catch (error) {
      console.error('Buy transaction error:', error);
      res.status(400).json({ error: error.message || 'Transaction failed' });
    }
  }
);

// Sell currency
router.post('/sell',
  [
    body('fromCurrency').isLength({ min: 3, max: 3 }).isUppercase(),
    body('toCurrency').isLength({ min: 3, max: 3 }).isUppercase(),
    body('amount').isFloat({ min: 0.01 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fromCurrency, toCurrency, amount } = req.body;
      const userId = req.user.userId;

      const transaction = await exchangeService.sellCurrency(
        userId,
        fromCurrency,
        toCurrency,
        amount
      );

      // Ensure numeric values are properly formatted
      const formattedTransaction = {
        ...transaction,
        from_amount: parseFloat(transaction.from_amount) || 0,
        to_amount: parseFloat(transaction.to_amount) || 0,
        exchange_rate: parseFloat(transaction.exchange_rate) || 0,
        commission: parseFloat(transaction.commission) || 0,
      };

      res.json({
        message: 'Transaction completed successfully',
        transaction: formattedTransaction
      });
    } catch (error) {
      console.error('Sell transaction error:', error);
      res.status(400).json({ error: error.message || 'Transaction failed' });
    }
  }
);

// Top up account
router.post('/topup',
  [
    body('currency').isLength({ min: 3, max: 3 }).isUppercase(),
    body('amount').isFloat({ min: 0.01 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currency, amount } = req.body;
      const userId = req.user.userId;

      const transaction = await exchangeService.topUpAccount(userId, currency, amount);

      res.json({
        message: 'Account topped up successfully',
        transaction
      });
    } catch (error) {
      console.error('Top up error:', error);
      res.status(400).json({ error: error.message || 'Top up failed' });
    }
  }
);

// Get wallet balance
router.get('/wallet', async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT currency_code, amount FROM currency_wallet WHERE user_id = $1 AND amount > 0',
      [userId]
    );

    res.json({ wallet: result.rows });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, transaction_type, from_currency, to_currency, 
              from_amount, to_amount, exchange_rate, commission, 
              status, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
