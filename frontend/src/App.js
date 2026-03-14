import React, { useState } from 'react';
import Home from './pages/Home';
import Subscriptions from './pages/Subscriptions';
import Chat from './pages/Chat';
import Vault from './pages/Vault';
import Notifications from './pages/Notifications';
import './App.css';

const TABS = [
  { id: 'home', label: 'Home', icon: '⬡' },
  { id: 'subscriptions', label: 'Subs', icon: '◈' },
  { id: 'chat', label: 'Agent', icon: '◎' },
  { id: 'vault', label: 'Vault', icon: '◆' },
  { id: 'alerts', label: 'Alerts', icon: '◉' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [leakAmount, setLeakAmount] = useState(193.93);

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home leakAmount={leakAmount} setLeakAmount={setLeakAmount} />;
      case 'subscriptions': return <Subscriptions leakAmount={leakAmount} setLeakAmount={setLeakAmount} />;
      case 'chat': return <Chat />;
      case 'vault': return <Vault />;
      case 'alerts': return <Notifications />;
      default: return <Home leakAmount={leakAmount} setLeakAmount={setLeakAmount} />;
    }
  };

  return (
    <div className="app">
      <div className="page-content">{renderPage()}</div>
      <nav className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
