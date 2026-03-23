'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const wdk = require('./services/wdkService');

const walletRoutes = require('./routes/wallet');
const subscriptionRoutes = require('./routes/subscriptions');
const agentRoutes = require('./routes/agent');
const firewallRoutes = require('./routes/firewall');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/wallet', walletRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/firewall', firewallRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'SubZero AI running 🧊',
    wdkConnected: wdk.isLive(),
  });
});

const PORT = process.env.PORT || 3001;

// Initialise WDK before accepting traffic, but don't block startup if it
// fails — routes will serve demo data instead.
wdk.init().then((live) => {
  app.listen(PORT, () => {
    const mode = live ? 'LIVE (WDK connected)' : 'DEMO (no seed phrase)';
    console.log(`🧊 SubZero backend running on port ${PORT} — mode: ${mode}`);
  });
});
