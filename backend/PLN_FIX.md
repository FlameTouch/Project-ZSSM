# Виправлення помилки "Currency PLN not found"

## Проблема
NBP API не надає курс для PLN, оскільки це базова валюта (всі інші валюти вже виражені в PLN).

## Рішення
Додано перевірку PLN у всіх місцях, де може виникати запит до NBP API:

1. **backend/services/nbpService.js**:
   - `getCurrentRate()` - повертає курс 1.0 для PLN
   - `getHistoricalRate()` - повертає курс 1.0 для PLN
   - `getRatesInRange()` - повертає масив з одним елементом (курс 1.0) для PLN

2. **backend/services/exchangeService.js**:
   - `getExchangeRate()` - вже має перевірку PLN на початку

## Важливо!
**Після змін потрібно перезапустити backend сервер:**

```bash
cd backend
# Зупиніть поточний процес (Ctrl+C)
npm start
# або для розробки:
npm run dev
```

## Перевірка
Після перезапуску спробуйте виконати транзакцію з PLN - помилка має зникнути.
