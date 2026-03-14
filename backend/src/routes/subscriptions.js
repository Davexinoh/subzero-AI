const express = require('express');
const router = express.Router();

let subscriptions = [
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

// GET /api/subscriptions/detect
router.get('/detect', (req, res) => res.json(subscriptions));

// POST /api/subscriptions/cancel
router.post('/cancel', (req, res) => {
  const { id } = req.body;
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  sub.active = false;
  sub.blocked = true;
  res.json({ success: true, message: `${sub.name} cancelled. Saving $${sub.amount}/month.` });
});

// POST /api/subscriptions/pause
router.post('/pause', (req, res) => {
  const { id, months = 1 } = req.body;
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  sub.active = false;
  res.json({ success: true, message: `${sub.name} paused for ${months} month(s).` });
});

// POST /api/subscriptions/reduce
router.post('/reduce', (req, res) => {
  const { percentage } = req.body;
  const total = subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0);
  const target = total * (percentage / 100);
  const order = { high:0, medium:1, safe:2 };
  const candidates = subscriptions.filter(s => s.active).sort((a,b) => order[a.riskScore]-order[b.riskScore] || b.amount-a.amount);
  let saved = 0;
  const toCancel = [];
  for (const sub of candidates) {
    if (saved >= target) break;
    toCancel.push(sub);
    saved += sub.amount;
  }
  res.json({ targetSaving: target.toFixed(2), actualSaving: saved.toFixed(2), toCancel: toCancel.map(s => ({ id:s.id, name:s.name, amount:s.amount })), newMonthly: (total-saved).toFixed(2), originalMonthly: total.toFixed(2) });
});

module.exports = router;
