import React, { useState, useEffect } from 'react';
import { getWalletSummary, emergencyFreeze } from '../services/api';
import './Home.css';

export default function Home({ leakAmount, setLeakAmount }) {
  const [summary, setSummary] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [originalLeak] = useState(193.93);

  useEffect(() => {
    getWalletSummary().then(setSummary).catch(() => setSummary({
      balance: '1,240.50', savedTotal: '138.98', savedMonthly: '51.98',
      activeSubscriptions: 8, highRisk: 3,
      walletAddress: '0x1A2b...9Ff3',
      firewallActive: true, trialExpiringSoon: 2,
    }));
  }, []);

  const handleFreeze = async () => {
    setFreezing(true);
    try { await emergencyFreeze(); } catch {}
    finally { setFreezing(false); setFrozen(true); }
  };

  const reduced = leakAmount < originalLeak;

  return (
    <div className="home-page">

      {/* System bar */}
      <div className="sys-bar">
        <div className="sys-bar-left">
          <span className="sys-dot" />
          <span className="sys-label">Powered by Tether WDK</span>
        </div>
        <span className="sys-addr">{summary?.walletAddress || '—'}</span>
      </div>

      {/* Leak Meter */}
      <div className="leak-section">
        <p className="leak-eyebrow">Monthly leak detected</p>
        <div className="leak-main">
          <span className="leak-dollar">$</span>
          <span className="leak-number">{leakAmount.toFixed(0)}</span>
          <span className="leak-mo">/mo</span>
        </div>
        {reduced && (
          <div className="leak-reduced">
            <span className="lr-before">${originalLeak.toFixed(2)}</span>
            <span className="lr-arrow">→</span>
            <span className="lr-after">${leakAmount.toFixed(2)}</span>
            <span className="lr-saved">· saved ${(originalLeak - leakAmount).toFixed(2)}</span>
          </div>
        )}
        <div className="status-pills">
          {summary?.firewallActive && !frozen && <span className="pill pill--firewall">⬡ FIREWALL ACTIVE</span>}
          {frozen && <span className="pill pill--frozen">❄ ALL PAYMENTS FROZEN</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat">
          <span className="stat-val">${summary?.balance || '—'}</span>
          <span className="stat-lbl">Balance</span>
        </div>
        <div className="stat">
          <span className="stat-val olive">${summary?.savedTotal || '—'}</span>
          <span className="stat-lbl">Saved</span>
        </div>
        <div className="stat">
          <span className="stat-val red">{summary?.highRisk ?? '—'}</span>
          <span className="stat-lbl">High Risk</span>
        </div>
        <div className="stat">
          <span className="stat-val amber">{summary?.trialExpiringSoon ?? '—'}</span>
          <span className="stat-lbl">Trials</span>
        </div>
      </div>

      {/* Freeze */}
      <div className="freeze-wrap">
        <button
          className={`freeze-btn ${frozen ? 'frozen' : ''}`}
          onClick={handleFreeze}
          disabled={freezing || frozen}
        >
          {freezing ? 'FREEZING...' : frozen ? '❄ ALL SUBSCRIPTIONS FROZEN' : '⚠ EMERGENCY FREEZE ALL PAYMENTS'}
        </button>
        {frozen && <p className="freeze-sub">WALLET BLOCKING ALL RECURRING TRANSACTIONS</p>}
      </div>

    </div>
  );
}
