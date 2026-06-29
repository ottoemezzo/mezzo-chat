// api/chat.js
// Vercel serverless function — secure proxy to Anthropic.
// The API key lives only here in an environment variable; the browser
// never sees it.

const SYSTEM_PROMPT = `Du bist ein freundlicher Medienbildungs-Assistent von mezzo.media \
– dem Schweizer Kompetenzzentrum für Eltern, Lehrpersonen und Betreuungspersonen \
im deutschsprachigen Raum.

Deine Fachgebiete:
- Bildschirmzeit und digitale Gesundheit
- Social Media (TikTok, Instagram, YouTube) und Online-Sicherheit
- Gaming: Chancen und Risiken für Kinder und Jugendliche
- KI und neue Technologien kindgerecht erklärt
- Cybermobbing – Erkennen und Handeln
- Lehrplan 21 / Medien & Informatik
- Altersgerechte Medienempfehlungen

Stil: Antworte immer auf Deutsch (Schweizer Standarddeutsch, Du-Form), \
freundlich, direkt und ohne Fachjargon. Maximal 3–4 kurze Absätze pro Antwort. \
Bei Fragen, die nichts mit digitalen Medien oder Medienbildung zu tun haben, \
lenke freundlich zurück.`;

// ── Rate limiter (in-memory; resets on cold start) ────────────────────────────
const rateLimitMap = new Map();

function isRateLimited(ip, maxRequests = 10, windowMs = 60_000) {
  const now = Date.now();
  const hits = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (hits.length >= maxRequests) return true;
  rateLimitMap.set(ip, [...hits, now]);
  return false;
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {

  // CORS — scope to your domain(s) via the ALLOWED_ORIGINS env var
 res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] || '127.0.0.1').split(',')[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Zu viele Anfragen. Bitte warte eine Minute.' });
  }

  // Validate request body
  let messages;
  try {
    messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('Empty messages');

    for (const m of messages) {
      if (!['user', 'assistant'].includes(m.role))        throw new Error(`Bad role: ${m.role}`);
      if (typeof m.content !== 'string')                  throw new Error('Content not a string');
      if (m.content.length > 4000)                        throw new Error('Message too long');
    }
    if (messages[0].role !== 'user') throw new Error('First message must be from user');

    // Cap conversation length to limit token spend
    if (messages.length > 50) messages = messages.slice(-50);
  } catch (err) {
    console.warn('[mezzo-chat] Validation error:', err.message);
    return res.status(400).json({ error: 'Ungültige Anfrage.' });
  }

  // Call Anthropic
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      console.error('[mezzo-chat] Anthropic error:', upstream.status, err);
      return res.status(502).json({
        error: 'KI-Dienst vorübergehend nicht erreichbar. Bitte versuche es später.',
      });
    }

    const data  = await upstream.json();
    const reply = data.content?.[0]?.text || 'Entschuldigung, es ist ein Fehler aufgetreten.';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[mezzo-chat] Handler error:', err);
    return res.status(500).json({ error: 'Interner Fehler. Bitte versuche es später erneut.' });
  }
};
