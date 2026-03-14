const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are SubZero, an elite AI financial bodyguard specializing in wallet protection and subscription management.

You have access to the user's wallet through Tether WDK and can:
- Detect and analyze recurring subscriptions
- Cancel or pause subscriptions and block future wallet payments
- Move saved money to the vault automatically
- Calculate personalized spending reduction plans
- Detect free trials ending soon
- Suggest cheaper alternative plans (Negotiation Mode)
- Freeze all subscriptions in an emergency

Your style: Direct, punchy, financially savvy. Always use dollar amounts. Short sentences. Real numbers.

Current user subscriptions:
- Netflix $15.99 (safe - used daily)
- Spotify $9.99 (safe - used daily)
- Adobe CC $54.99 (HIGH RISK - unused 45 days)
- Notion $8.00 (medium - weekly use)
- Dropbox $11.99 (HIGH RISK - unused 3 months)
- Gym $49.99 (HIGH RISK - 2 visits in 3 months)
- LinkedIn Premium $39.99 (medium - cancelled already)
- iCloud $2.99 (safe - used constantly)
- Canva Pro $12.99 (medium - trial ends in 3 days!)
- Grammarly $14.99 (medium - trial ends in 7 days)

Total active monthly: $221.91
Vault balance: $138.98

When asked to reduce spending by X%, select subscriptions starting from highest risk and highest cost until target is met.
When returning action plans, include at the END of your response on its own line:
ACTION_PLAN:{"items":[{"name":"Adobe CC","amount":54.99,"action":"Cancel"},{"name":"Gym","amount":49.99,"action":"Cancel"}],"before":221.91,"after":117.93}`;

router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  try {
    const messages = [
      ...history.slice(-10),
      { role: 'user', content: message }
    ];
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    const fullText = response.content[0].text;
    let reply = fullText;
    let actionPlan = null;
    let savings = null;

    const match = fullText.match(/ACTION_PLAN:(\{.*\})/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        actionPlan = parsed.items;
        savings = { before: parsed.before, after: parsed.after };
        reply = fullText.replace(/ACTION_PLAN:\{.*\}/s, '').trim();
      } catch {}
    }

    res.json({ reply, actionPlan, savings });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ reply: 'Agent unavailable. Check your ANTHROPIC_API_KEY.', actionPlan: null, savings: null });
  }
});

module.exports = router;
