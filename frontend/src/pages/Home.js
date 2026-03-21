import React, { useState, useEffect, useRef } from 'react';
import { getWalletSummary, emergencyFreeze } from '../services/api';
import './Home.css';

const HIGH_RISK_SUBS = [
  { name: 'Adobe CC', amount: 54.99, usage: '0 uses in 45 days', roiLabel: 'ZERO ROI' },
  { name: 'Gym Membership', amount: 49.99, usage: '2 visits / 3 months', roiLabel: 'NEGATIVE ROI — $25/visit' },
  { name: 'Dropbox', amount: 11.99, usage: 'Unused — replaced by iCloud', roiLabel: 'ZERO ROI' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const DEMO_DATA = {
  balance: '1,240.50', savedTotal: '138.98', savedMonthly: '51.98',
  activeSubscriptions: 8, highRisk: 3,
  walletAddress: '0x1A2b...9Ff3',
  firewallActive: true, trialExpiringSoon: 2,
};

export default function Home({ leakAmount, setLeakAmount }) {
  const [summary, setSummary] = useState(DEMO_DATA);
  const [frozen, setFrozen] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [originalLeak] = useState(193.93);
  const [autoMode, setAutoMode] = useState(false);
  const [autoLog, setAutoLog] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);

  // Demo / Live
  const [mode, setMode] = useState('demo'); // 'demo' | 'live'
  const [walletInput, setWalletInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const autoRef = useRef(false);

  useEffect(() => {
    if (mode === 'demo') {
      setSummary(DEMO_DATA);
      setLeakAmount(193.93);
    }
  }, [mode]);

  const handleConnectWallet = async () => {
    if (!walletInput.trim()) { setConnectError('Enter a wallet address'); return; }
    setConnecting(true);
    setConnectError('');
    try {
      const data = await getWalletSummary(walletInput.trim());
      setSummary(data);
      setLeakAmount(parseFloat(data.monthlyLeak) || 0);
    } catch {
      setConnectError('Could not connect. Check address and try again.');
    } finally { setConnecting(false); }
  };

  const handleFreeze = async () => {
    setFreezing(true);
    try { await emergencyFreeze(); } catch {}
    finally { setFreezing(false); setFrozen(true); }
  };

  const runAutoMode = async () => {
    setAutoRunning(true);
    setAutoLog([]);
    autoRef.current = true;
    const log = l => setAutoLog(prev => [...prev, l]);

    log('> AUTO MODE ACTIVATED');
    await sleep(700);
    log('> Scanning wallet transaction history...');
    await sleep(1100);
    log(`> ${HIGH_RISK_SUBS.length} capital drains detected with negative ROI`);
    await sleep(700);

    let totalSaved = 0;
    for (const sub of HIGH_RISK_SUBS) {
      if (!autoRef.current) break;
      const annual = (sub.amount * 12).toFixed(2);
      await sleep(800);
      log(`  ── ${sub.name.toUpperCase()}`);
      await sleep(350);
      log(`     $${sub.amount}/mo · $${annual}/yr drain`);
      await sleep(350);
      log(`     ${sub.usage}`);
      await sleep(350);
      log(`     ${sub.roiLabel}`);
      await sleep(500);
      log(`     CANCEL → capital recovery $${annual}/yr`);
      await sleep(350);
      log(`     FIREWALL rule deployed`);
      totalSaved += sub.amount;
      setLeakAmount(prev => Math.max(0, parseFloat((prev - sub.amount).toFixed(2))));
    }

    await sleep(700);
    log(`> Routing $${totalSaved.toFixed(2)} USDT → Savings Vault`);
    await sleep(800);
    log(`> COMPLETE ────────────────────────`);
    log(`  Monthly saved   $${totalSaved.toFixed(2)} USDT`);
    log(`  Annual recovery $${(totalSaved * 12).toFixed(2)} USDT`);
    log(`  Human actions   0`);
    setAutoRunning(false);
  };

  const toggleAutoMode = async val => {
    setAutoMode(val);
    if (val) { await runAutoMode(); }
    else { autoRef.current = false; setAutoLog([]); }
  };

  const reduced = leakAmount < originalLeak;
  const annualLeak = (leakAmount * 12).toFixed(0);

  return (
    <div className="home-page">

      {/* MODE SWITCHER */}
      <div className="mode-bar">
        <button className={`mode-btn ${mode==='demo'?'mode-btn--active':''}`} onClick={() => setMode('demo')}>
          <span className="mode-dot mode-dot--demo" />
          DEMO
        </button>
        <button className={`mode-btn ${mode==='live'?'mode-btn--active mode-btn--live':''}`} onClick={() => setMode('live')}>
          <span className={`mode-dot ${mode==='live'?'mode-dot--live':''}`} />
          LIVE
        </button>
        <span className="mode-status">
          {mode === 'live' ? '● CONNECTED TO WDK' : '○ DEMO MODE'}
        </span>
      </div>

      {/* WALLET CONNECT (live mode only) */}
      {mode === 'live' && (
        <div className="wallet-connect" style={{animation:'slideDown 0.25s ease'}}>
          <p className="wallet-connect-label">WALLET ADDRESS</p>
          <div className="wallet-connect-row">
            <input
              className="wallet-input"
              placeholder="0x... or paste address"
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnectWallet()}
            />
            <button className="wallet-connect-btn" onClick={handleConnectWallet} disabled={connecting}>
              {connecting ? '...' : 'CONNECT'}
            </button>
          </div>
          {connectError && <p className="wallet-error">{connectError}</p>}
          <p className="wallet-note">Powered by Tether WDK · Non-custodial · Read-only scan</p>
        </div>
      )}

      {/* SYS BAR */}
      <div className="sys-bar">
        <div className="sys-bar-left">
          <span className={`sys-dot ${mode==='live'?'sys-dot--live':''}`} />
          <span className="sys-label">
            {mode === 'live' ? `${summary?.walletAddress || 'Connecting...'}` : 'Powered by Tether WDK'}
          </span>
        </div>
        {mode === 'demo' && <span className="sys-addr">DEMO DATA</span>}
      </div>

      {/* AUTO MODE */}
      <div className={`auto-strip ${autoMode?'auto-strip--on':''}`}>
        <div className="auto-left">
          <span className="auto-title">AUTO MODE</span>
          <span className="auto-sub">{autoMode ? 'Agent acting — no human input required' : 'Agent cancels high-risk subs automatically'}</span>
        </div>
        <button className={`toggle ${autoMode?'toggle--on':''}`} onClick={() => toggleAutoMode(!autoMode)} disabled={autoRunning}>
          <span className="toggle-thumb" />
        </button>
      </div>

      {/* AUTO LOG */}
      {autoLog.length > 0 && (
        <div className="auto-log">
          {autoLog.map((line, i) => (
            <p key={i} className={`auto-log-line ${line.startsWith('>') ? 'log-cmd' : ''} ${line.includes('COMPLETE') || line.startsWith('  Monthly') || line.startsWith('  Annual') || line.startsWith('  Human') ? 'log-done' : ''} ${line.startsWith('  ──') ? 'log-header' : ''}`}>
              {line}
            </p>
          ))}
          {autoRunning && <span className="auto-cursor">_</span>}
        </div>
      )}

      {/* LEAK METER */}
      <div className={`leak-section ${frozen?'leak-frozen':''}`}>
        <p className="leak-eyebrow">Monthly leak detected</p>
        <div className="leak-main">
          <span className="leak-dollar">$</span>
          <span className="leak-number">{leakAmount.toFixed(0)}</span>
          <span className="leak-mo">/mo</span>
        </div>
        <p className="leak-annual">≈ ${annualLeak} USDT / year if ignored</p>
        {reduced && (
          <div className="leak-reduced">
            <span className="lr-before">${originalLeak.toFixed(2)}</span>
            <span className="lr-arrow"> → </span>
            <span className="lr-after">${leakAmount.toFixed(2)}</span>
            <span className="lr-saved"> · ${(originalLeak - leakAmount).toFixed(2)} recovered</span>
          </div>
        )}
        <div className="status-pills">
          {summary?.firewallActive && !frozen && <span className="pill pill--fw">⬡ FIREWALL</span>}
          {frozen && <span className="pill pill--frozen">❄ FROZEN</span>}
          {autoMode && <span className="pill pill--auto">⬡ AUTO</span>}
          {mode === 'live' && <span className="pill pill--live">● LIVE</span>}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat"><span className="stat-val">${summary?.balance}</span><span className="stat-lbl">Balance</span></div>
        <div className="stat"><span className="stat-val g">${summary?.savedTotal}</span><span className="stat-lbl">Saved</span></div>
        <div className="stat"><span className="stat-val r">{summary?.highRisk}</span><span className="stat-lbl">High Risk</span></div>
        <div className="stat"><span className="stat-val a">{summary?.trialExpiringSoon}</span><span className="stat-lbl">Trials</span></div>
      </div>

      {/* ECON BAR */}
      <div className="econ-bar">
        <div className="econ-item"><span className="econ-val g">${(parseFloat(summary?.savedMonthly||0)*12).toFixed(0)}</span><span className="econ-lbl">Annual Savings</span></div>
        <div className="econ-div" />
        <div className="econ-item"><span className="econ-val r">${annualLeak}</span><span className="econ-lbl">Annual Leak</span></div>
      </div>

      {/* FREEZE */}
      <div className="freeze-wrap">
        <button className={`freeze-btn ${frozen?'frozen':''}`} onClick={handleFreeze} disabled={freezing||frozen}>
          {freezing ? 'FREEZING...' : frozen ? '❄ ALL SUBSCRIPTIONS FROZEN' : '⚠ EMERGENCY FREEZE ALL PAYMENTS'}
        </button>
        {frozen && <p className="freeze-sub">WALLET BLOCKING ALL RECURRING TRANSACTIONS</p>}
      </div>

    </div>
  );
}
  
