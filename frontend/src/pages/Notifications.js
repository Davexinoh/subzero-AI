import React, { useState } from 'react';
import './Notifications.css';

const NOTIFS = [
  { id:'1', type:'trial', title:'⏰ Trial Ending Soon', body:'Canva Pro trial ends in 3 days. Cancel now to avoid $12.99/mo.', time:'2h ago', read:false },
  { id:'2', type:'suspicious', title:'🚨 Suspicious Subscription', body:'New recurring payment detected: "CloudStorage Pro" $8.99/mo. Did you sign up for this?', time:'5h ago', read:false },
  { id:'3', type:'saved', title:'💚 Money Saved', body:'SubZero blocked 2 payments this month. You saved $51.98 automatically.', time:'1d ago', read:false },
  { id:'4', type:'firewall', title:'🛡️ Firewall Blocked Payment', body:'LinkedIn Premium tried to charge $39.99. Blocked by SubZero firewall.', time:'2d ago', read:true },
  { id:'5', type:'new_sub', title:'📋 New Recurring Payment', body:'Detected: Grammarly Premium $14.99/month starting Mar 1.', time:'3d ago', read:true },
  { id:'6', type:'trial', title:'⏰ Trial Ending Soon', body:'Grammarly trial ends in 7 days. Cancel before Mar 7 to avoid charge.', time:'3d ago', read:true },
  { id:'7', type:'goal', title:'🎯 Closer to Goal', body:"You're 28% to your $500 savings goal! Cancel 2 more subs to reach it in 4 months.", time:'1w ago', read:true },
];

const DOT_COLOR = { new_sub:'cyan', saved:'green', suspicious:'red', trial:'amber', firewall:'cyan', goal:'purple' };

export default function Notifications() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="page notifs-page">
      <div className="notifs-header">
        <span className="notifs-title">Alerts {unread > 0 && <span className="unread-count">{unread} new</span>}</span>
        {unread > 0 && <button className="mark-all" onClick={() => setNotifs(p => p.map(n => ({...n, read:true})))}>Mark all read</button>}
      </div>
      <div className="notifs-list">
        {notifs.map(n => (
          <button key={n.id} className={`notif-card ${!n.read?'notif-card--unread':''}`} onClick={() => setNotifs(p => p.map(x => x.id===n.id?{...x,read:true}:x))}>
            <span className={`notif-dot notif-dot--${DOT_COLOR[n.type]}`} />
            <div className="notif-body">
              <p className="notif-title">{n.title}</p>
              <p className="notif-text">{n.body}</p>
              <p className="notif-time">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
