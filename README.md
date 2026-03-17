# TrueRate - Mobile Currency Exchange System

System mobilnego kantoru wymiany walut TrueRate to w pełni funkcjonalna platforma do wymiany walut z integracją z API Narodowego Banku Polskiego (NBP).

## Opis projektu

TrueRate umożliwia użytkownikom:
- Przeglądanie aktualnych kursów walut z NBP API
- Dostęp do archiwalnych kursów walut
- Wykonywanie transakcji kupna/sprzedaży walut
- Doładowanie konta (symulowany wirtualny przelew)
- Przegląd historii transakcji i stanu portfela

## Architektura systemu

Projekt składa się z trzech głównych komponentów:

### 1. Backend (Web Service)
- **Technologie**: Node.js, Express.js, PostgreSQL
- **Funkcje**:
  - REST API do komunikacji z aplikacją mobilną
  - Integracja z NBP API do pobierania kursów walut
  - Logika biznesowa kantoru (prowizja 0.5%)
  - Walidacja danych i autoryzacja użytkowników
  - Cache’owanie kursów walut w celu zmniejszenia obciążenia NBP API

### 2. Baza danych
- **DBMS**: PostgreSQL
- **Tabele**:
  - `users` - informacje o użytkownikach
  - `currency_wallet` - salda użytkowników wg walut
  - `transactions` - historia transakcji
  - `exchange_rates` - cache kursów walut

### 3. Aplikacja mobilna
- **Technologie**: React Native, Expo
- **Ekrany**:
  - Rejestracja i logowanie
  - Podgląd aktualnych kursów walut
  - Wymiana walut (kupno/sprzedaż)
  - Portfel (salda i doładowanie)
  - Historia transakcji

## Instalacja i uruchomienie

### Wymagania
- Node.js (v14 lub nowszy)
- PostgreSQL (v12 lub nowszy)
- npm lub yarn
- Expo CLI (dla aplikacji mobilnej)

### Backend

1. Przejdź do katalogu backend:
```bash
cd backend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Utwórz plik `.env` na podstawie `.env.example`:
```bash
cp .env.example .env
```

4. Skonfiguruj zmienne środowiskowe w `.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=truerate
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
NBP_API_URL=https://api.nbp.pl/api
```

5. Utwórz bazę danych PostgreSQL:
```sql
CREATE DATABASE truerate;
```

6. Uruchom skrypt SQL tworzący tabele:
```bash
psql -U postgres -d truerate -f database/schema.sql
```

7. Uruchom serwer:
```bash
npm start
# lub w trybie deweloperskim z automatycznym przeładowaniem:
npm run dev
```

Backend będzie dostępny pod `http://localhost:3000`

### Aplikacja mobilna

1. Przejdź do katalogu mobile:
```bash
cd mobile
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Zaktualizuj URL API w `config/api.js` (jeśli backend działa pod innym adresem):
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

4. Uruchom aplikację:
```bash
npm start
```

5. Zeskanuj kod QR w Expo Go na telefonie lub naciśnij `a` dla emulatora Android albo `i` dla symulatora iOS.

## API Endpoints

### Autoryzacja
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie

### Wymiana walut
- `GET /api/exchange/rates/current` - Pobierz aktualne kursy
- `GET /api/exchange/rates/historical/:currency` - Pobierz kurs historyczny
- `GET /api/exchange/currencies` - Lista dostępnych walut
- `POST /api/exchange/buy` - Kup walutę
- `POST /api/exchange/sell` - Sprzedaj walutę
- `POST /api/exchange/topup` - Doładuj konto
- `GET /api/exchange/wallet` - Pobierz salda
- `GET /api/exchange/transactions` - Historia transakcji

## Struktura projektu

```
Project ZAM/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── exchange.js
│   ├── services/
│   │   ├── nbpService.js
│   │   └── exchangeService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── mobile/
│   ├── config/
│   │   └── api.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── RatesScreen.js
│   │   ├── ExchangeScreen.js
│   │   ├── WalletScreen.js
│   │   └── HistoryScreen.js
│   ├── services/
│   │   ├── authService.js
│   │   └── exchangeService.js
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   └── package.json
└── README.md
```

## Funkcje na przyszłość

- **Bezpieczeństwo**: tokeny JWT do autoryzacji, haszowanie haseł za pomocą bcrypt
- **Cache**: zapisywanie kursów walut w bazie danych dla szybszego dostępu
- **Walidacja**: weryfikacja danych po stronie serwera i klienta
- **Prowizja**: automatyczne naliczanie prowizji 0.5% przy wymianie
- **Historia**: pełna historia wszystkich transakcji użytkownika

## Autor

Viacheslav Lisovskyi
