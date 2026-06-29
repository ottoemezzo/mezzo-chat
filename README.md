# mezzo.media Chat Widget



A production-ready AI chat widget for mezzo.media, powered by Claude.

## How it works

```
Browser (widget.js)
    │  POST /api/chat  { messages: [...] }
    ▼
Vercel function (api/chat.js)   ← API key lives only here
    │  POST https://api.anthropic.com/v1/messages
    ▼
Claude (claude-sonnet-4-6)
```

The browser never sees the API key. All it knows is your `/api/chat` endpoint.

---

## Setup in 4 steps

### 1. Install the Vercel CLI

```bash
npm install -g vercel
```

### 2. Add your Anthropic API key

**For Vercel deployment (production):**
```bash
vercel env add ANTHROPIC_API_KEY
# paste your key when prompted
```

**For local development:**
```bash
cp .env.example .env.local
# then edit .env.local and paste your key
```

### 3. Deploy

```bash
vercel deploy --prod
```

Vercel gives you a URL like `https://mezzo-chat-xyz.vercel.app`.

### 4. Embed the widget on mezzo.media

Paste these two lines before `</body>` on every page:

```html
<script>
  window.MezzoChat = {
    endpoint: 'https://mezzo-chat-xyz.vercel.app/api/chat'
  };
</script>
<script src="https://mezzo-chat-xyz.vercel.app/public/widget.js"></script>
```

That's it. The widget appears as a floating button in the bottom-right corner.

---

## Local development

```bash
vercel dev
```

Then open `http://localhost:3000/public/demo.html` in your browser.

---

## Configuration options

All keys are optional (defaults shown):

```html
<script>
  window.MezzoChat = {
    endpoint:   'https://mezzo-chat-xyz.vercel.app/api/chat',
    brandBlue:  '#2855A0',               // Primary color (header, bot avatar)
    brandCoral: '#E8522A',               // Accent color (user bubbles, send btn)
    title:      'mezzo.media',           // Name in the header
    subtitle:   'Medienbildungs-Assistent',
    welcome:    'Hallo! Wie kann ich helfen?',  // Opening message
    position:   'bottom-right',          // or 'bottom-left'
  };
</script>
```

---

## Customising the AI persona

Edit `SYSTEM_PROMPT` at the top of `api/chat.js`. This is where you define:

- **Topics the bot will answer** (media literacy, specific age groups, etc.)
- **Language and tone** (currently: German, informal Du-Form, max 4 paragraphs)
- **What it redirects away from** (off-topic questions)

The system prompt is server-side only — users cannot see or override it.

---

## Security

| Layer | Protection |
|---|---|
| **API key** | Server-side env var only — never sent to browser |
| **CORS** | Lock to your domain via `ALLOWED_ORIGINS` env var |
| **Rate limit** | 10 requests / IP / minute (configurable in `api/chat.js`) |
| **Input validation** | Messages validated before forwarding; max 4000 chars each; max 50 per session |
| **Prompt injection** | System prompt is server-side and structurally separate from user input |

### Setting ALLOWED_ORIGINS in Vercel

```bash
vercel env add ALLOWED_ORIGINS
# value: https://mezzo.media,https://www.mezzo.media
```

---

## Project structure

```
mezzo-chat/
├── api/
│   └── chat.js          Vercel serverless function (the proxy + system prompt)
├── public/
│   ├── widget.js        Self-contained embeddable widget (no dependencies)
│   └── demo.html        Demo page — open this to test locally
├── .env.example         Copy to .env.local for local dev
├── package.json
├── vercel.json          Vercel config (sets 30s timeout for the function)
└── README.md
```

---

## Troubleshooting

**Widget doesn't appear**
→ Open DevTools → Console. If you see a CORS error, add your domain to `ALLOWED_ORIGINS`.

**"KI-Dienst vorübergehend nicht erreichbar"**
→ Check that `ANTHROPIC_API_KEY` is set: `vercel env ls`

**Works locally but not in production**
→ Make sure you ran `vercel deploy --prod` (not just `vercel deploy`, which creates a preview URL)

**Widget conflicts with existing CSS**
→ All widget classes are prefixed with `mzw-` to avoid collisions. If you still see conflicts, open an issue.
