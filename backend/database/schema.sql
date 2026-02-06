-- TrueRate Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency wallet (user balances)
CREATE TABLE IF NOT EXISTS currency_wallet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency_code VARCHAR(3) NOT NULL,
    amount DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, currency_code)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'TOPUP')),
    from_currency VARCHAR(3),
    to_currency VARCHAR(3),
    from_amount DECIMAL(15, 2),
    to_amount DECIMAL(15, 2),
    exchange_rate DECIMAL(15, 6),
    commission DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exchange rates cache (to reduce NBP API calls)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL,
    rate DECIMAL(15, 6) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'NBP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(currency_code, date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON currency_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON exchange_rates(currency_code);
