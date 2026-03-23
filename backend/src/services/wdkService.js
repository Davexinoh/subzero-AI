'use strict';

const WalletManagerEvm = require('@tetherto/wdk-wallet-evm').default;

// USDT contract address on Base mainnet
const USDT_CONTRACT = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';

// Base mainnet public RPC — swap for a paid provider in production
const BASE_RPC = 'https://mainnet.base.org';

let _walletManager = null;
let _account = null;

/**
 * Initialise the WDK wallet manager from the seed phrase stored in env.
 * Called once at server startup. Returns false if no seed phrase is configured
 * so callers can fall back to demo data instead of crashing.
 */
async function init() {
  const seed = process.env.WDK_SEED_PHRASE;

  if (!seed) {
    console.warn('[wdk] WDK_SEED_PHRASE not set — running in demo mode');
    return false;
  }

  try {
    _walletManager = new WalletManagerEvm(seed, {
      provider: process.env.RPC_URL || BASE_RPC,
      transferMaxFee: 500000000000000n, // 0.0005 ETH max fee cap
    });

    _account = await _walletManager.getAccount(0);
    const address = await _account.getAddress();
    console.log(`[wdk] Wallet connected: ${address}`);
    return true;
  } catch (err) {
    console.error('[wdk] Failed to initialise wallet manager:', err.message);
    return false;
  }
}

/**
 * Returns the initialised WalletAccountEvm instance.
 * Throws if init() was never called or failed.
 */
function getAccount() {
  if (!_account) {
    throw new Error('WDK not initialised. Call wdkService.init() at startup.');
  }
  return _account;
}

/**
 * Returns true when the wallet is live (seed phrase present and connected).
 */
function isLive() {
  return _account !== null;
}

module.exports = { init, getAccount, isLive, USDT_CONTRACT };
