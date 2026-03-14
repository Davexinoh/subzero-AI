# 🧊 SubZero AI

> Autonomous AI wallet agent that stops money leaks from forgotten subscriptions.

Built with Tether WDK · Hackathon Galactica 2026

---

## What it does

SubZero AI connects to your USDT wallet via Tether WDK, scans transaction history, detects recurring subscriptions, scores their risk, and lets an AI agent take real actions — cancelling payments, blocking merchants via a wallet-level firewall, and routing savings to a vault automatically.

## Features

- 💸 Live Leak Meter — "You are leaking $193/month"
- 🔴 Subscription Risk Scores — High / Medium / Safe per subscription
- 🤖 AI Agent Chat — "Reduce my spending by 30%"
- 🛡️ Subscription Firewall — blocks future payments at wallet level
- ❄️ Emergency Freeze — one tap blocks all recurring payments
- 🏦 Savings Vault — auto-moves saved money with autopilot
- ⏰ Free Trial Detector — alerts before billing starts
- 🎯 Savings Goal Mode — AI recommends what to cancel to hit your goal
- 💡 Negotiation Mode — suggests cheaper plan alternatives
- 🔔 Smart Notifications Feed — real-time alerts

## Tech Stack

- **Frontend:** React (GitHub Pages)
- **Backend:** Node.js + Express (Render)
- **AI Agent:** Claude API (Anthropic)
- **Wallet:** Tether WDK (`@tetherto/wdk-wallet-evm`)

## Third-Party Disclosures

- Claude API by Anthropic — AI agent intelligence
- Tether WDK by Tether — wallet connection, transaction scanning, payment rules
- React — frontend framework
- Axios — HTTP client

## Setup

### Backend (Render)
```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY and WDK_API_KEY
npm install
npm start
```

### Frontend (GitHub Pages)
```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL to your Render backend URL
npm install
npm run build
```

## Environment Variables

**Backend** (`backend/.env`):
```
ANTHROPIC_API_KEY=your_key_here
WDK_API_KEY=your_key_here
PORT=3001
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=https://your-app.onrender.com/api
```

## License

Apache 2.0 — see LICENSE file
