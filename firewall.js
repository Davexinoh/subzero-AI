const express = require('express');
const router = express.Router();

let blockedMerchants = ['LinkedIn Premium'];
let emergencyFrozen = false;

router.get('/status', (req, res) => {
  res.json({ blockedMerchants, emergencyFrozen, firewallActive: blockedMerchants.length > 0 || emergencyFrozen });
});

router.post('/block', (req, res) => {
  const { merchantName } = req.body;
  if (!blockedMerchants.includes(merchantName)) blockedMerchants.push(merchantName);
  res.json({ success: true, blockedMerchants, message: `🛡️ ${merchantName} added to firewall` });
});

router.post('/unblock', (req, res) => {
  const { merchantName } = req.body;
  blockedMerchants = blockedMerchants.filter(m => m !== merchantName);
  res.json({ success: true, blockedMerchants });
});

router.post('/freeze', (req, res) => {
  emergencyFrozen = true;
  res.json({ success: true, emergencyFrozen: true, message: '❄️ Emergency freeze activated.' });
});

router.post('/unfreeze', (req, res) => {
  emergencyFrozen = false;
  res.json({ success: true, emergencyFrozen: false });
});

module.exports = router;
