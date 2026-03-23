# SubZero AI

## Overview
Autonomous AI wallet agent that detects and manages recurring subscription payments (money leaks) connected to a USDT wallet via Tether WDK. Built for Hackathon Galactica 2026.

## Architecture
- **Frontend:** React (Create React App) on port 5000
- **Backend:** Node.js + Express on port 3001
- **AI:** Anthropic Claude API for the chat agent
- **Wallet:** Tether WDK (`@tetherto/wdk-wallet-evm`) for blockchain interactions on Base mainnet

## Project Structure
```
.
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry point
│   │   ├── routes/           # API routes (agent, firewall, subscriptions, wallet)
│   │   └── services/
│   │       └── wdkService.js # Tether WDK wallet integration
│   ├── .env                  # Backend environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages (Chat, Home, Notifications, Subscriptions, Vault)
│   │   ├── services/
│   │   │   └── api.js        # Axios API client
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                  # Frontend environment variables
│   └── package.json
└── README.md
```

## Running the Application

### Workflows
- **Start application** — Runs the React frontend on port 5000 (webview)
- **Start Backend** — Runs the Express backend on port 3001 (console)

### Environment Variables

**backend/.env**
```
PORT=3001
ANTHROPIC_API_KEY=    # Required for AI chat agent
WDK_SEED_PHRASE=      # Optional: USDT wallet seed phrase (runs in demo mode without it)
RPC_URL=              # Optional: custom Base RPC endpoint
```

**frontend/.env**
```
PORT=5000
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_URL=http://localhost:3001/api
```

## Key Features
- Live Leak Meter — visualizes monthly subscription spending
- AI Agent Chat — powered by Claude API
- Subscription Firewall — blocks payments at wallet level
- Emergency Freeze — blocks all recurring payments in one tap
- Savings Vault — auto-moves saved funds
- Smart Notifications feed

## Demo Mode
The backend runs in demo mode when `WDK_SEED_PHRASE` is not set — all routes return mock data so the frontend is fully functional without a real wallet connection.
