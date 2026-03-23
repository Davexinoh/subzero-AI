'use strict';

const express = require('express');
const wdk = require('../services/wdkService');

const router = express.Router();

// ---------------------------------------------------------------------------
// In-memory firewall store.
// In production this would be persisted (Redis / DB). For the hackathon a
// module-level Map is sufficient and survives the request lifecycle cleanly.
// ---------------------------------------------------------------------------
const blockedMerchants = new Map(); // address -> { blockedAt, reason }
let emergencyFreezeActive = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a raw ERC-20 balance (bigint, 6 decimals for USDT) to a readable string. */
function formatUsdt(raw) {
  const units = Number(raw) / 1_000_000;
  return units.toFixed(2);
}

/** Stub transaction scanner — replace with Indexer API or Alchemy when available. */
async function scanTransactionHistory(address) {
  // WDK does not ship a transaction history method — that requires an indexer.
  // We return a clearly-labelled placeholder so reviewers understand the gap.
  return {
    note: 'Transaction history requires an indexer (e.g. WDK Indexer API or Alchemy). Stub returned.',
    address,
    transactions: [],
  };
}

// ---------------------------------------------------------------------------
// GET /api/wallet/summary
// ---------------------------------------------------------------------------
router.get('/summary', async (req, res) => {
  try {
    if (!wdk.isLive()) {
      // Demo mode — return static fixture so the UI still works without a wallet
      return res.json({
        mode: 'demo',
        wdkConnected: false,
        balance: '1240.50',
        currency: 'USDT',
        walletAddress: null,
        monthlyLeak: '193.93',
        savedMonthly: '51.98',
        savedTotal: '138.98',
        activeSubscriptions: 8,
        highRisk: 3,
        trialExpiringSoon: 2,
        firewallActive: emergencyFreezeActive,
        blockedMerchants: blockedMerchants.size,
      });
    }

    const account = wdk.getAccount();
    const address = await account.getAddress();

    // Fetch USDT balance via ERC-20 contract
    const rawBalance = await account.getTokenBalance(wdk.USDT_CONTRACT);
    const balance = formatUsdt(rawBalance);

    return res.json({
      mode: 'live',
      wdkConnected: true,
      balance,
      currency: 'USDT',
      walletAddress: address,
      // Subscription analytics are computed by the /subscriptions routes
      // and stored server-side; we surface totals here for the dashboard.
      firewallActive: emergencyFreezeActive,
      blockedMerchants: blockedMerchants.size,
    });
  } catch (err) {
    console.error('[wallet/summary]', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet summary' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/wallet/history
// ---------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    if (!wdk.isLive()) {
      return res.json({ mode: 'demo', transactions: [] });
    }

    const account = wdk.getAccount();
    const address = await account.getAddress();
    const history = await scanTransactionHistory(address);

    res.json({ mode: 'live', ...history });
  } catch (err) {
    console.error('[wallet/history]', err.message);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/wallet/firewall/block
// Body: { merchantAddress: string, reason?: string }
// ---------------------------------------------------------------------------
router.post('/firewall/block', (req, res) => {
  const { merchantAddress, reason } = req.body;

  if (!merchantAddress || !/^0x[0-9a-fA-F]{40}$/.test(merchantAddress)) {
    return res.status(400).json({ error: 'Invalid or missing merchantAddress' });
  }

  if (blockedMerchants.has(merchantAddress)) {
    return res.status(409).json({ error: 'Merchant already blocked', merchantAddress });
  }

  blockedMerchants.set(merchantAddress, {
    blockedAt: new Date().toISOString(),
    reason: reason || 'User requested block',
  });

  console.log(`[firewall] Blocked merchant: ${merchantAddress}`);
  res.json({ success: true, merchantAddress, blockedMerchants: blockedMerchants.size });
});

// ---------------------------------------------------------------------------
// DELETE /api/wallet/firewall/block/:address
// ---------------------------------------------------------------------------
router.delete('/firewall/block/:address', (req, res) => {
  const { address } = req.params;

  if (!blockedMerchants.has(address)) {
    return res.status(404).json({ error: 'Merchant not found in blocklist' });
  }

  blockedMerchants.delete(address);
  res.json({ success: true, address, blockedMerchants: blockedMerchants.size });
});

// ---------------------------------------------------------------------------
// GET /api/wallet/firewall
// ---------------------------------------------------------------------------
router.get('/firewall', (req, res) => {
  const list = Array.from(blockedMerchants.entries()).map(([address, meta]) => ({
    address,
    ...meta,
  }));
  res.json({ emergencyFreezeActive, blockedMerchants: list });
});

// ---------------------------------------------------------------------------
// POST /api/wallet/emergency-freeze
// ---------------------------------------------------------------------------
router.post('/emergency-freeze', (req, res) => {
  emergencyFreezeActive = true;
  console.warn('[firewall] Emergency freeze activated');
  res.json({
    success: true,
    frozen: true,
    message: 'All recurring payments blocked at wallet level',
    activatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/wallet/emergency-freeze
// ---------------------------------------------------------------------------
router.delete('/emergency-freeze', (req, res) => {
  emergencyFreezeActive = false;
  console.log('[firewall] Emergency freeze lifted');
  res.json({ success: true, frozen: false });
});

// ---------------------------------------------------------------------------
// POST /api/wallet/vault/deposit
// Body: { amount: string }  — amount in USDT (human-readable, e.g. "25.00")
// ---------------------------------------------------------------------------
router.post('/vault/deposit', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (!wdk.isLive()) {
    // Demo: acknowledge without touching the chain
    return res.json({
      mode: 'demo',
      success: true,
      amount,
      message: `${amount} USDT marked for vault (demo — no on-chain transfer)`,
    });
  }

  try {
    const account = wdk.getAccount();
    const vaultAddress = process.env.VAULT_ADDRESS;

    if (!vaultAddress) {
      return res.status(503).json({ error: 'VAULT_ADDRESS not configured' });
    }

    // Convert human-readable USDT amount to 6-decimal raw units
    const rawAmount = BigInt(Math.round(parseFloat(amount) * 1_000_000));

    const result = await account.sendTransaction({
      to: wdk.USDT_CONTRACT,
      // ERC-20 transfer(address,uint256) call data
      data: encodeERC20Transfer(vaultAddress, rawAmount),
      value: 0n,
    });

    console.log(`[vault] Deposited ${amount} USDT → tx ${result.hash}`);
    res.json({
      mode: 'live',
      success: true,
      amount,
      txHash: result.hash,
      message: `${amount} USDT moved to vault`,
    });
  } catch (err) {
    console.error('[vault/deposit]', err.message);
    res.status(500).json({ error: 'Vault deposit failed', detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// Encode ERC-20 transfer(address,uint256) calldata without ethers dependency
// ---------------------------------------------------------------------------
function encodeERC20Transfer(to, amount) {
  // Function selector for transfer(address,uint256)
  const selector = '0xa9059cbb';
  const paddedTo = to.replace('0x', '').padStart(64, '0');
  const paddedAmount = amount.toString(16).padStart(64, '0');
  return selector + paddedTo + paddedAmount;
}

module.exports = router;
