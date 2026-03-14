import React, { useState, useEffect } from 'react';
import { detectSubscriptions, cancelSubscription, pauseSubscription } from '../services/api';
import './Subscriptions.css';

const RISK = {
  high: { label: '🔴 High Risk', cls: 'badge-red' },
  medium: { label: '🟠 Medium', cls: 'badge-amber' },
  safe: { label: '🟢 Safe', cls: 'badge-green' },
};

const MOCK = [
  { id:'1', name:'Netflix', amount:15.99, lastUsed:'Today', active:true, blocked:false, logo:'🎬', riskScore:'safe', riskReason:'Used daily. Great value.', isTrial:false, cheaperPlan:'Standard plan', cheaperPlanSaving:6 },
  { id:'2', name:'Spotify', amount:9.99, lastUsed:'Today', active:true, blocked:false, logo:'🎵', riskScore:'safe', riskReason:'Used daily.', isTrial:false },
  { id:'3', name:'Adobe CC', amount:54.99, lastUsed:'45 days ago', active:true, blocked:false, logo:'🎨', riskScore:'high', riskReason:'Unused for 45 days. Very expensive.', isTrial:false, cheaperPlan:'Single-app plan', cheaperPlanSaving:35 },
  { id:'4', name:'Notion', amount:8.00, lastUsed:'Last week', active:true, blocked:false, logo:'📝', riskScore:'medium', riskReason:'Light use. Free plan available.', isTrial:false, cheaperPlan:'Free plan', cheaperPlanSaving:8 },
  { id:'5', name:'Dropbox', amount:11.99, lastUsed:'3 months ago', active:true, blocked:false, logo:'☁️', riskScore:'high', riskReason:'Not used in 3 months. Replaced by iCloud.', isTrial:false },
  { id:'6', name:'Gym', amount:49.99, lastUsed:'5 weeks ago', active:true, blocked:false, logo:'💪', riskScore:'high', riskReason:'2 check-ins in 3 months. $25/visit effectively.', isTrial:false },
  { id:'7', name:'LinkedIn Premium', amount:39.99, lastUsed:'2 months ago', active:false, blocked:true, logo:'💼', riskScore:'medium', riskReason:'Low usage. High cost.', isTrial:false },
  { id:'8', name:'iCloud', amount:2.99, lastUsed:'Today', active:true, blocked:false, logo:'🍎', riskScore:'safe', riskReason:'Used constantly. Very cheap.', isTrial:false },
  { id:'9', name:'Canva Pro', amount:12.99, lastUsed:'Today', active:true, blocked:false, logo:'🖌️', riskScore:'medium', riskReason:'Free trial ending in 3 days!', isTrial:true, trialEndsIn:3 },
  { id:'10', name:'Grammarly', amount:14.99, lastUsed:'Today', active:true, blocked:false, logo:'✍️', riskScore:'medium', riskReason:'Trial ends in 7 days.', isTrial:true, trialEndsIn:7 },
];

export default function Subscriptions({ leakAmount, setLeakAmount }) {
  const [subs, setSubs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    detectSubscriptions().then(setSubs).catch(() => setSubs(MOCK));
  }, []);

  const handleCancel = async (id) => {
    const sub = subs.find(s => s.id === id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: false, blocked: true } : s));
    setLeakAmount(prev => Math.max(0, parseFloat((prev - sub.amount).toFixed(2))));
    await cancelSubscription(id).catch(() => {});
    setSelected(null);
  };

  const handlePause = async (id) => {
    const sub = subs.find(s => s.id === id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
    setLeakAmount(prev => Math.max(0, parseFloat((prev - sub.amount).toFixed(2))));
    await pauseSubscription(id, 1).catch(() => {});
    setSelected(null);
  };

  const filtered = subs.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'trial') return s.isTrial;
    return s.riskScore === filter;
  });

  const totalLeak = subs.filter(s => s.active).reduce((a, s) => a + s.amount, 0);
  const highRiskLeak = subs.filter(s => s.active && s.riskScore === 'high').reduce((a, s) => a + s.amount, 0);

  return (
    <div className="subs-page">
      <div className="subs-summary">
        <div>
          <p className="subs-total">💸 ${totalLeak.toFixed(2)}/mo total</p>
          <p className="subs-high">🔴 ${highRiskLeak.toFixed(2)}/mo high risk</p>
        </div>
        <span className="subs-count">{subs.filter(s => s.active).length} active</span>
      </div>

      <div className="filter-row">
        {['all','high','medium','safe','trial'].map(f => (
          <button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
            {f==='all'?'All':f==='trial'?'⏰ Trials':f==='high'?'🔴 High':f==='medium'?'🟠 Med':'🟢 Safe'}
          </button>
        ))}
      </div>

      <div className="subs-list">
        {filtered.map(sub => (
          <button key={sub.id} className={`sub-card ${!sub.active?'sub-card--off':''}`} onClick={() => setSelected(sub)}>
            <span className="sub-logo">{sub.logo}</span>
            <div className="sub-info">
              <div className="sub-name-row">
                <span className="sub-name">{sub.name}</span>
                {sub.blocked && <span className="badge badge-cyan">🛡️ Blocked</span>}
                {sub.isTrial && <span className="badge badge-amber">⏰ Trial</span>}
              </div>
              <span className="sub-meta">Last used: {sub.lastUsed}</span>
              <span className={`badge ${RISK[sub.riskScore].cls}`}>{RISK[sub.riskScore].label}</span>
              {sub.isTrial && <span className="trial-warn">⚠️ Billing in {sub.trialEndsIn} days</span>}
            </div>
            <span className={`sub-amount ${!sub.active?'muted':''}`}>${sub.amount}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-logo">{selected.logo}</span>
              <div>
                <p className="modal-name">{selected.name}</p>
                <p className="modal-amount">${selected.amount}/month</p>
              </div>
              <span className={`badge ${RISK[selected.riskScore].cls}`}>{RISK[selected.riskScore].label}</span>
            </div>
            <p className="modal-reason">{selected.riskReason}</p>
            {selected.cheaperPlan && (
              <div className="negotiation-box">
                <p className="negotiation-title">💡 Negotiation Mode</p>
                <p className="negotiation-text">Switch to {selected.cheaperPlan} — save ${selected.cheaperPlanSaving}/mo</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => handleCancel(selected.id)}>❌ Cancel Subscription</button>
              <button className="btn btn-ghost" onClick={() => handlePause(selected.id)}>⏸️ Pause 1 Month</button>
              {selected.cheaperPlan && <button className="btn btn-green">💰 Switch to Cheaper Plan</button>}
            </div>
            <button className="modal-close" onClick={() => setSelected(null)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
