import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api';
import './Chat.css';

const QUICK = [
  { label: '💸 Reduce 30%', msg: "Reduce my spending by 30%" },
  { label: '🗑️ Cancel unused', msg: "Cancel all subscriptions I haven't used in 2 months" },
  { label: '⏰ Expiring trials', msg: "Show me all trials expiring soon" },
  { label: '🔴 High risk', msg: "What are my highest risk subscriptions?" },
  { label: '💡 Negotiate', msg: "Find cheaper alternatives for my subscriptions" },
  { label: '🎯 Save $500', msg: "What should I cancel to save $500 in 3 months?" },
];

export default function Chat() {
  const [messages, setMessages] = useState([{
    id: '0', role: 'assistant',
    content: "Hey — I'm SubZero 🧊 Your AI financial bodyguard.\n\nI've scanned your wallet and found 10 subscriptions costing $221/month. You have 3 high-risk subs draining $116/month.\n\nWhat do you want to do about it?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const result = await sendMessage(msg, messages);
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: result.reply, actionPlan: result.actionPlan, savings: result.savings,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: "Connection issue. Make sure the backend is running!",
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.map(m => (
          <div key={m.id} className={`bubble-wrap ${m.role === 'user' ? 'bubble-wrap--user' : ''}`}>
            {m.role === 'assistant' && <span className="bubble-avatar">🧊</span>}
            <div className={`bubble ${m.role === 'user' ? 'bubble--user' : 'bubble--bot'}`}>
              <p className="bubble-text">{m.content}</p>
              {m.actionPlan?.length > 0 && (
                <div className="action-plan">
                  <p className="action-plan-title">📋 Action Plan</p>
                  {m.actionPlan.map((a, i) => (
                    <p key={i} className="action-plan-item">• {a.action} {a.name} — save ${a.amount}/mo</p>
                  ))}
                </div>
              )}
              {m.savings && (
                <div className="savings-box">
                  <div className="savings-col"><span className="savings-label">Before</span><span className="savings-before">${m.savings.before}/mo</span></div>
                  <span className="savings-arrow">→</span>
                  <div className="savings-col"><span className="savings-label">After</span><span className="savings-after">${m.savings.after}/mo</span></div>
                  <div className="savings-col"><span className="savings-label">Saved</span><span className="savings-diff">-${(m.savings.before - m.savings.after).toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble-wrap">
            <span className="bubble-avatar">🧊</span>
            <div className="bubble bubble--bot bubble--loading"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        <div className="quick-row">
          {QUICK.map(q => (
            <button key={q.msg} className="quick-btn" onClick={() => send(q.msg)}>{q.label}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask SubZero anything..."
          />
          <button className="send-btn" onClick={() => send()}>→</button>
        </div>
      </div>
    </div>
  );
}
