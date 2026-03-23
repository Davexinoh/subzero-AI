'use strict';

const WalletManagerEvm = require('@tetherto/wdk-wallet-evm').default;
const { WalletAccountReadOnlyEvm } = require('@tetherto/wdk-wallet-evm');

// USDT contract address on Base mainnet
const USDT_CONTRACT = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';

const BASE_RPC = process.env.RPC_URL || 'https://mainnet.base.org';

// App's own vault wallet — initialised from WDK_SEED_PHRASE at startup.
// This is NOT the user's wallet. It only handles vault deposits.
let _walletManager = null;
let _vaultAccount = null;

/**
 * Initialise the vault wallet from the seed phrase in env.
 * Called once at server startup. Returns false if no seed phrase is set —
 * vault deposits will be unavailable but read-only scanning still works.
 */
async function init() {
  const seed = process.env.WDK_SEED_PHRASE;

  if (!seed) {
    console.warn('[wdk] WDK_SEED_PHRASE not set — vault disabled, read-only scanning active');
    return false;
  }

  try {
    _walletManager = new WalletManagerEvm(seed, {
      provider: BASE_RPC,
      transferMaxFee: 500000000000000n, // 0.0005 ETH max fee cap
    });

    _vaultAccount = await _walletManager.getAccount(0);
    const address = await _vaultAccount.getAddress();
    console.log(`[wdk] Vault wallet ready: ${address}`);
    return true;
  } catch (err) {
    console.error('[wdk] Failed to initialise vault wallet:', err.message);
    return false;
  }
}

/**
 * Returns a WDK read-only account for any valid EVM address.
 * This is how SubZero scans a user's wallet — no seed phrase required.
 *
 * @param {string} address  0x-prefixed EVM address supplied by the user
 * @returns {WalletAccountReadOnlyEvm}
 */
function getReadOnlyAccount(address) {
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error(`Invalid wallet address: ${address}`);
  }
  return new WalletAccountReadOnlyEvm(address, { provider: BASE_RPC });
}

/**
 * Returns the vault account for sending transactions (deposits only).
 * Throws if WDK_SEED_PHRASE was not set at startup.
 */
function getVaultAccount() {
  if (!_vaultAccount) {
    throw new Error('Vault wallet not initialised — WDK_SEED_PHRASE missing in environment');
  }
  return _vaultAccount;
}

/** True when the vault wallet is live and capable of sending transactions. */
function isLive() {
  return _vaultAccount !== null;
}

module.exports = { init, getReadOnlyAccount, getVaultAccount, isLive, USDT_CONTRACT };
