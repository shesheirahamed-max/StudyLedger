const db = require('../config/db');

const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 25000;

const runInsert = async (sql, params) => {
  if (typeof db.promise === 'function') {
    await db.promise().query(sql, params);
  } else if (typeof db.query === 'function') {
    await new Promise((resolve) => {
      db.query(sql, params, (err) => {
        if (err) console.error('History Save Error:', err.message);
        resolve();
      });
    });
  }
};

const saveChatHistory = async (userId, userMessage, botReply) => {
  if (!userId) return;
  const sql = 'INSERT INTO chat_history (user_id, sender, message) VALUES (?, ?, ?)';
  try {
    await runInsert(sql, [userId, 'user', userMessage]);
    await runInsert(sql, [userId, 'bot', botReply]);
  } catch (err) {
    console.error('History Save Exception:', err.message);
  }
};

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Timeout: ${TIMEOUT_MS / 1000} সেকেন্ডে উত্তর আসেনি`);
    }
    throw new Error(`Network error: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(apiKey, modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || '')
      .join('')
      .trim() || '';

  if (!text) {
    const reason =
      data?.promptFeedback?.blockReason ||
      data?.candidates?.[0]?.finishReason ||
      'unknown';
    throw new Error(`Gemini থেকে খালি উত্তর এসেছে (reason: ${reason})`);
  }

  return text;
}

async function askOpenAICompatible(endpoint, apiKey, model, prompt) {
  const res = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `API HTTP ${res.status}`);
  }

  const text = data?.choices?.[0]?.message?.content?.trim() || '';
  if (!text) {
    throw new Error('AI প্রোভাইডার থেকে খালি উত্তর এসেছে');
  }

  return text;
}

function buildProviders(prompt) {
  const env = (k, d = '') => (process.env[k] || d).trim();
  const providers = [];

  const geminiKey = env('GEMINI_API_KEY');
  if (geminiKey) {
    const models = [env('GEMINI_MODEL'), 'gemini-3.8-flash'].filter(
      (m, i, arr) => m && arr.indexOf(m) === i
    );
    for (const m of models) {
      providers.push({
        name: `gemini:${m}`,
        run: () => askGemini(geminiKey, m, prompt)
      });
    }
  }

  if (env('GROQ_API_KEY')) {
    providers.push({
      name: 'groq',
      run: () =>
        askOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          env('GROQ_API_KEY'),
          env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
          prompt
        )
    });
  }

  if (env('OPENROUTER_API_KEY')) {
    providers.push({
      name: 'openrouter',
      run: () =>
        askOpenAICompatible(
          'https://openrouter.ai/api/v1/chat/completions',
          env('OPENROUTER_API_KEY'),
          env('OPENROUTER_MODEL', 'openrouter/free'),
          prompt
        )
    });
  }

  if (env('OPENAI_API_KEY')) {
    providers.push({
      name: 'openai',
      run: () =>
        askOpenAICompatible(
          'https://api.openai.com/v1/chat/completions',
          env('OPENAI_API_KEY'),
          env('OPENAI_MODEL', 'gpt-4o-mini'),
          prompt
        )
    });
  }

  return providers;
}

const handleChat = async (req, res) => {
  try {
    const { userId, message, mode = 'Academic & Coding' } = req.body || {};
    const cleanMessage = String(message || '').trim();

    if (!cleanMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt =
      `You are Control AI Policy Assistant inside StudyLedger. Mode: ${mode}.\n` +
      `Answer accurately and directly in the user's language.\n\n` +
      `Question: ${cleanMessage}`;

    const providers = buildProviders(prompt);
    if (providers.length === 0) {
      return res.status(500).json({
        error: 'কোনো AI API key সেট করা নেই। .env ফাইলে GEMINI_API_KEY দিন এবং সার্ভার রিস্টার্ট করুন।'
      });
    }

    let botReply = '';
    let providerUsed = '';
    const errors = [];

    for (const p of providers) {
      try {
        botReply = await p.run();
        providerUsed = p.name;
        break;
      } catch (err) {
        console.error(`[AI] ${p.name} ব্যর্থ:`, err.message);
        errors.push(`${p.name}: ${err.message}`);
      }
    }

    if (!botReply) {
      return res.status(502).json({
        error: 'কোনো AI প্রোভাইডার থেকে উত্তর পাওয়া যায়নি।',
        details: errors
      });
    }

    await saveChatHistory(userId, cleanMessage, botReply);
    return res.status(200).json({ reply: botReply, provider: providerUsed, mode });
  } catch (error) {
    console.error('Chat Handler Error:', error);
    return res.status(500).json({ error: error.message || 'সার্ভারে সমস্যা হয়েছে।' });
  }
};

module.exports = { handleChat };