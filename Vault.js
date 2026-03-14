import React, { useState } from 'react';
import './Vault.css';

const HISTORY = [
  { date: 'Feb 28, 2026', amount: 39.99, source: 'LinkedIn Premium cancelled', auto: true },
  { date: 'Feb 15, 2026', amount: 11.99, source: 'Dropbox blocked by firewall', auto: true },
  { date: 'Jan 20, 2026', amount: 49.99, source: 'Gym membership cancelled', auto: false },
  { date: 'Jan 01, 2026', amount: 24.99, source: 'Adobe CC paused (1 month)', auto: false },
  { date: 'Dec 10, 2025', amount: 12.02, source: 'Manual deposit', auto: false },
];

export default function Vault() {
  const [autopilot, setAutopilot] = useState(true);
  const balance = 138.98;
  const goal = 500;
  const progress = Math.min((balance / goal) * 100, 100);

  return (
    <div className="page vault-page">
      <div className="vault-card">
        <span className="vault-icon">🏦</span>
        <p className="vault-label">Savings Vault</p>
        <p className="vault-balance">${balance.toFixed(2)}</p>
        <p className="vault-currency">USDT · Powered by Tether WDK</p>
        <div className="vault-stats">
          <div className="vault-stat">
            <span className="vault-stat-num">$51.98</span>
            <span className="vault-stat-label">This month</span>
          </div>
          <div className="vault-divider" />
          <div className="vault-stat">
            <span className="vault-stat-num">{HISTORY.length}</span>
            <span className="vault-stat-label">Deposits</span>
          </div>
        </div>
      </div>

      <div className="goal-card">
        <div className="goal-header">
          <span className="goal-title">🎯 Savings Goal</span>
          <span className="goal-pct">{progress.toFixed(0)}%</span>
        </div>
        <div className="goal-nums">
          <span className="goal-current">${balance.toFixed(0)}</span>
          <span className="goal-of"> / ${goal}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <p className="goal-remaining">${(goal - balance).toFixed(2)} to go</p>
      </div>

      <div className="autopilot-card">
        <div>
          <p className="autopilot-title">🤖 Savings Autopilot</p>
          <p className="autopilot-sub">Auto-move savings from cancelled subs to vault</p>
        </div>
        <button className={`toggle ${autopilot ? 'toggle--on' : ''}`} onClick={() => setAutopilot(p => !p)}>
          <span className="toggle-thumb" />
        </button>
      </div>
      {autopilot && <p className="autopilot-active">✅ Active — savings move automatically</p>}

      <p className="section-title">Transaction History</p>
      {HISTORY.map((item, i) => (
        <div key={i} className="history-item">
          <div>
            <p className="history-date">{item.date}</p>
            <p className="history-source">{item.source}</p>
            {item.auto && <p className="history-auto">🤖 Auto-saved</p>}
          </div>
          <span className="history-amount">+${item.amount.toFixed(2)}</span>
        </div>
      ))}

      <button className="btn btn-green" style={{ marginTop: 12, marginBottom: 32 }}>↑ Withdraw to Main Wallet</button>
    </div>
  );
}
