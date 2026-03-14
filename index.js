require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.get('/health', (req, res) => res.json({ status: 'SubZero AI running 🧊' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🧊 SubZero backend running on port ${PORT}`));
