const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 25000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function generateFromGemini(apiKey, modelName, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const rawText =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || '')
      .join('')
      .trim() || '';

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed.questions)) {
    throw new Error('Invalid quiz JSON format');
  }
  return parsed.questions;
}

const generateQuiz = async (req, res) => {
  try {
    const {
      courseTitle = 'Java Core',
      lessonTitle = 'JVM & Main Method',
      count = 10,
      avoidQuestions = []
    } = req.body || {};

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const modelName = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing in .env' });
    }

    const prompt = `
Generate ${count} unique multiple-choice technical quiz questions for:
Course: ${courseTitle}
Topic: ${lessonTitle}

Rules:
- Questions must be practical, conceptual, and code/scenario-oriented so the learner masters the topic.
- Do NOT repeat or closely paraphrase any of these previous questions:
${JSON.stringify(avoidQuestions.slice(-40))}

Return ONLY valid JSON matching this exact structure:
{
  "questions": [
    {
      "id": "unique-id",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Concise explanation of why the answer is correct"
    }
  ]
}
`.trim();

    const questions = await generateFromGemini(apiKey, modelName, prompt);
    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Quiz Generate Error:', err.message);
    return res.status(500).json({ error: err.message || 'কুইজ তৈরি করা যায়নি।' });
  }
};

module.exports = { generateQuiz };