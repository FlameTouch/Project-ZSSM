# TrueRate Backend API

Backend сервер для системи обміну валют TrueRate.

## Встановлення

1. Встановіть залежності:
```bash
npm install
```

2. Налаштуйте змінні оточення:
```bash
cp .env.example .env
# Відредагуйте .env файл з вашими налаштуваннями
```

3. Створіть базу даних та запустіть міграції:
```bash
psql -U postgres -d truerate -f database/schema.sql
```

4. Запустіть сервер:
```bash
npm start
# або для розробки:
npm run dev
```

## API Документація

### Авторизація

#### Реєстрація
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Вхід
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Обмін валют (потребує авторизації)

#### Отримати актуальні курси
```
GET /api/exchange/rates/current?currencies=USD,EUR,GBP
Authorization: Bearer <token>
```

#### Отримати історичний курс
```
GET /api/exchange/rates/historical/USD?date=2024-01-15
Authorization: Bearer <token>
```

#### Отримати курси за період
```
GET /api/exchange/rates/historical/USD?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Купити валюту
```
POST /api/exchange/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromCurrency": "PLN",
  "toCurrency": "USD",
  "amount": 1000
}
```

#### Продати валюту
```
POST /api/exchange/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromCurrency": "USD",
  "toCurrency": "PLN",
  "amount": 100
}
```

#### Поповнити рахунок
```
POST /api/exchange/topup
Authorization: Bearer <token>
Content-Type: application/json

{
  "currency": "PLN",
  "amount": 5000
}
```

#### Отримати баланси
```
GET /api/exchange/wallet
Authorization: Bearer <token>
```

#### Отримати історію транзакцій
```
GET /api/exchange/transactions?limit=50&offset=0
Authorization: Bearer <token>
```

## Структура бази даних

- **users** - користувачі системи
- **currency_wallet** - баланси користувачів по валютах
- **transactions** - історія транзакцій
- **exchange_rates** - кеш курсів валют з NBP API

## Бізнес-логіка

- Комісія при обміні: 0.5%
- Всі транзакції виконуються через PLN (польський злотий)
- Курси валют кешуються в базі даних для зменшення навантаження на NBP API
