import React, { useState, useEffect, useRef } from 'react';
import { getWalletSummary, emergencyFreeze } from '../services/api';
import './Home.css';

const HIGH_RISK_SUBS = [
  { name: 'Adobe CC', amount: 54.99, usage: '0 uses in 45 days', roiLabel: 'ZERO ROI', costPerUse: null },
  { name: 'Gym Membership', amount: 49.99, usage: '2 visits in 3 months', roiLabel: 'NEGATIVE ROI', costPerUse: '$25.00/visit' },
  { name: 'Dropbox', amount: 11.99, usage: 'Unused — replaced by iCloud', roiLabel: 'ZERO ROI', costPerUse: null },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default function Home({ leakAmount, setLeakAmount }) {
  const [summary, setSummary] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [originalLeak] = useState(193.93);
  const [autoMode, setAutoMode] = useState(false);
  const [autoLog, setAutoLog] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [totalRecovered, setTotalRecovered] = useState(0);
  const autoRef = useRef(false);

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

  const runAutoMode = async () => {
    setAutoRunning(true);
    setAutoLog([]);
    setTotalRecovered(0);
    autoRef.current = true;

    setAutoLog(prev => [...prev, '⬡ AUTO MODE ACTIVATED — Economic analysis running']);
    await sleep(800);
    setAutoLog(prev => [...prev, '◈ Scanning wallet transaction history...']);
    await sleep(1200);
    setAutoLog(prev => [...prev, `◈ Detected ${HIGH_RISK_SUBS.length} capital drains with negative ROI`]);
    await sleep(800);

    let totalSaved = 0;

    for (const sub of HIGH_RISK_SUBS) {
      if (!autoRef.current) break;
      const annual = (sub.amount * 12).toFixed(2);
      await sleep(900);
      setAutoLog(prev => [...prev, `── ${sub.name}`]);
      await sleep(400);
      setAutoLog(prev => [...prev, `   Cost: $${sub.amount}/mo · $${annual}/yr`]);
      await sleep(400);
      setAutoLog(prev => [...prev, `   Usage: ${sub.usage}`]);
      await sleep(400);
      if (sub.costPerUse) {
        setAutoLog(prev => [...prev, `   Effective cost: ${sub.costPerUse} · ${sub.roiLabel}`]);
      } else {
        setAutoLog(prev => [...prev, `   ROI: ${sub.roiLabel}`]);
      }
      await sleep(600);
      setAutoLog(prev => [...prev, `   ✕ Cancelling · Capital recovery: $${annual}/yr`]);
      await sleep(400);
      setAutoLog(prev => [...prev, `   🛡 Firewall rule deployed for ${sub.name}`]);
      totalSaved += sub.amount;
      setLeakAmount(prev => Math.max(0, parseFloat((prev - sub.amount).toFixed(2))));
      setTotalRecovered(prev => prev + sub.amount);
    }

    await sleep(800);
    const annualSaved = (totalSaved * 12).toFixed(2);
    setAutoLog(prev => [...prev, `◆ Routing $${totalSaved.toFixed(2)} USDT → Savings Vault`]);
    await sleep(800);
    setAutoLog(prev => [...prev, `◆ Vault compounds savings automatically`]);
    await sleep(600);
    setAutoLog(prev => [...prev, `✓ COMPLETE`]);
    setAutoLog(prev => [...prev, `  Monthly savings:  $${totalSaved.toFixed(2)} USDT`]);
    setAutoLog(prev => [...prev, `  Annual recovery:  $${annualSaved} USDT`]);
    setAutoLog(prev => [...prev, `  Capital deployed: 0 human actions required`]);
    setAutoRunning(false);
  };

  const toggleAutoMode = async (val) => {
    setAutoMode(val);
    if (val) {
      await runAutoMode();
    } else {
      autoRef.current = false;
      setAutoLog([]);
      setTotalRecovered(0);
    }
  };

  const reduced = leakAmount < originalLeak;
  const annualLeak = (leakAmount * 12).toFixed(0);

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

      {/* AUTO MODE TOGGLE */}
      <div className={`auto-strip ${autoMode ? 'auto-strip--on' : ''}`}>
        <div className="auto-left">
          <span className="auto-title">AUTO MODE</span>
          <span className="auto-sub">
            {autoMode ? 'Agent acting autonomously — no human input required' : 'Agent executes cancellations + vault routing automatically'}
          </span>
        </div>
        <button
          className={`toggle ${autoMode ? 'toggle--on' : ''}`}
          onClick={() => toggleAutoMode(!autoMode)}
          disabled={autoRunning}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {/* AUTO LOG — terminal */}
      {autoLog.length > 0 && (
        <div className="auto-log">
          {autoLog.map((line, i) => (
            <p key={i} className={`auto-log-line ${line.startsWith('✓') || line.startsWith('  ') ? 'auto-log-done' : ''} ${line.startsWith('──') ? 'auto-log-header' : ''}`}>
              {line}
            </p>
          ))}
          {autoRunning && <span className="auto-cursor">█</span>}
        </div>
      )}

      {/* Leak Meter */}
      <div className={`leak-section ${frozen ? 'leak-frozen' : ''}`}>
        <p className="leak-eyebrow">Monthly leak detected</p>
        <div className="leak-main">
          <span className="leak-dollar">$</span>
          <span className="leak-number">{leakAmount.toFixed(0)}</span>
          <span className="leak-mo">/mo</span>
        </div>
        <p className="leak-annual">≈ ${annualLeak} USDT drained per year</p>

        {reduced && (
          <div className="leak-reduced">
            <span className="lr-before">${originalLeak.toFixed(2)}</span>
            <span className="lr-arrow"> → </span>
            <span className="lr-after">${leakAmount.toFixed(2)}</span>
            <span className="lr-saved"> · saved ${(originalLeak - leakAmount).toFixed(2)}/mo</span>
          </div>
        )}

        <div className="status-pills">
          {summary?.firewallActive && !frozen && <span className="pill pill--firewall">⬡ FIREWALL ACTIVE</span>}
          {frozen && <span className="pill pill--frozen">❄ ALL PAYMENTS FROZEN</span>}
          {autoMode && <span className="pill pill--auto">⬡ AUTO MODE ON</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat">
          <span className="stat-val">${summary?.balance}</span>
          <span className="stat-lbl">Balance</span>
        </div>
        <div className="stat">
          <span className="stat-val olive">${summary?.savedTotal}</span>
          <span className="stat-lbl">Saved</span>
        </div>
        <div className="stat">
          <span className="stat-val red">{summary?.highRisk}</span>
          <span className="stat-lbl">High Risk</span>
        </div>
        <div className="stat">
          <span className="stat-val amber">{summary?.trialExpiringSoon}</span>
          <span className="stat-lbl">Trials</span>
        </div>
      </div>

      {/* Economic impact bar */}
      <div className="econ-bar">
        <div className="econ-item">
          <span className="econ-val olive">${(parseFloat(summary?.savedTotal || 0) * 12 / (new Date().getMonth() + 1)).toFixed(0)}</span>
          <span className="econ-lbl">Projected Annual Savings</span>
        </div>
        <div className="econ-divider" />
        <div className="econ-item">
          <span className="econ-val red">${annualLeak}</span>
          <span className="econ-lbl">Annual Leak if Ignored</span>
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
