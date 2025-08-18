# BudgetMate (React + Node + MySQL)

## Prerequisites
- Node.js 18+
- MySQL 8+
- (Optional) Gmail App Password for email OTP
- (Optional) Twilio credentials for phone OTP

## Setup

### 1) Database
Create `.env` in **backend** from `.env.example` and set DB creds.
The API auto-creates the database and tables.

```bash
cd backend
cp .env.example .env
# edit .env with your values
npm install
npm run dev
```

### 2) Email/Twilio (OTP)
- Email OTP uses Nodemailer (configure EMAIL_* in backend .env).
- Phone OTP uses Twilio; if not configured, server logs OTP to console for dev.

### 3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm start
```

Open http://localhost:3000

Login flow shows welcome splash, dashboard has salary/expenses/balance and a pie chart.
Transactions support CSV download. Goals derive progress from "savings" transactions (optionally link to a goal).

Enjoy!
