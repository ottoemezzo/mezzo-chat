/**
 * mezzo.media Chat Widget  v1.0
 * Drop-in script — no dependencies, no build step.
 *
 * Usage:
 *   <script>
 *     window.MezzoChat = { endpoint: 'https://your-deployment.vercel.app/api/chat' };
 *   </script>
 *   <script src="widget.js"></script>
 *
 * All config keys are optional (defaults shown below).
 */
(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const cfg = Object.assign({
    endpoint:   '/api/chat',
    brandBlue:  '#2855A0',
    brandCoral: '#E8522A',
    title:      'mezzo.media',
    subtitle:   'Medienbildungs-Assistent',
    welcome:    'Hallo \uD83D\uDC4B Ich bin der Medienbildungs-Assistent von mezzo.media.\n\n' +
                'Ich helfe dir bei Fragen zu Bildschirmzeit, Social Media, Gaming und ' +
                'Online-Sicherheit \u2013 f\u00FCr Eltern, Lehrpersonen und Betreuungspersonen.\n\n' +
                'Was m\u00F6chtest du wissen?',
    position:   'bottom-right',  // 'bottom-right' | 'bottom-left'
  }, window.MezzoChat || {});

  const B = cfg.brandBlue;
  const C = cfg.brandCoral;
  const SIDE = cfg.position === 'bottom-left' ? 'left' : 'right';

  // ── Styles ─────────────────────────────────────────────────────────────────
  const CSS = `
.mzw *,.mzw *::before,.mzw *::after{box-sizing:border-box;margin:0;padding:0;}
.mzw{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;}

/* Launcher */
.mzw-btn{
  position:fixed;${SIDE}:20px;bottom:20px;z-index:2147483647;
  width:52px;height:52px;border-radius:50%;
  background:${B};border:none;cursor:pointer;color:#fff;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 18px rgba(0,0,0,.28);
  transition:transform .15s,background .15s;
}
.mzw-btn:hover{transform:scale(1.06);}
.mzw-btn svg{width:22px;height:22px;flex-shrink:0;}

/* Panel */
.mzw-panel{
  position:fixed;${SIDE}:20px;bottom:82px;z-index:2147483646;
  width:356px;max-width:calc(100vw - 40px);height:500px;
  background:#fff;border-radius:14px;
  border:1px solid rgba(0,0,0,.1);
  box-shadow:0 12px 48px rgba(0,0,0,.16);
  display:flex;flex-direction:column;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
}
.mzw-panel[hidden]{display:none;}
@keyframes mzw-up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.mzw-panel:not([hidden]){animation:mzw-up .2s ease-out;}

/* Header */
.mzw-head{
  background:${B};padding:13px 14px;
  display:flex;align-items:center;gap:10px;flex-shrink:0;
}
.mzw-av{
  width:32px;height:32px;border-radius:8px;
  background:rgba(255,255,255,.15);
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:13px;color:#fff;letter-spacing:-1px;flex-shrink:0;
}
.mzw-ht{flex:1;}
.mzw-ht-name{color:#fff;font-weight:600;font-size:14px;line-height:1;}
.mzw-ht-sub{color:rgba(255,255,255,.65);font-size:11px;margin-top:3px;display:flex;align-items:center;gap:4px;}
.mzw-dot{width:5px;height:5px;border-radius:50%;background:#4ADE80;}
.mzw-xbtn{
  background:rgba(255,255,255,.12);border:none;cursor:pointer;
  color:rgba(255,255,255,.85);border-radius:6px;padding:5px;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;flex-shrink:0;
}
.mzw-xbtn:hover{background:rgba(255,255,255,.22);}
.mzw-xbtn svg{width:16px;height:16px;}

/* Messages */
.mzw-msgs{
  flex:1;overflow-y:auto;padding:14px 0;
  display:flex;flex-direction:column;gap:2px;
  scrollbar-width:thin;scrollbar-color:#e5e7eb transparent;
}
.mzw-msgs::-webkit-scrollbar{width:3px;}
.mzw-msgs::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:3px;}

.mzw-msg{display:flex;padding:4px 16px;align-items:flex-start;gap:8px;}
.mzw-msg.u{flex-direction:row-reverse;}
.mzw-msg-av{
  width:26px;height:26px;border-radius:6px;background:${B};
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;letter-spacing:-.5px;
  flex-shrink:0;margin-top:2px;
}
.mzw-bubble{
  max-width:78%;padding:9px 13px;font-size:13.5px;line-height:1.58;
  white-space:pre-wrap;word-break:break-word;
}
.mzw-msg.u  .mzw-bubble{background:${C};color:#fff;border-radius:14px 4px 14px 14px;}
.mzw-msg.bt .mzw-bubble{background:#EDF1FB;color:#1a1a24;border-radius:4px 14px 14px 14px;}

/* Typing dots */
@keyframes mzw-d{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
.mzw-td{
  display:inline-block;width:6px;height:6px;border-radius:50%;
  background:${B};opacity:.4;animation:mzw-d 1.2s ease-in-out infinite;
}
.mzw-td:nth-child(2){animation-delay:.2s;}
.mzw-td:nth-child(3){animation-delay:.4s;}

/* Input area */
.mzw-foot{
  padding:10px 12px;border-top:1px solid #f3f4f6;
  display:flex;gap:8px;align-items:flex-end;flex-shrink:0;
}
.mzw-input{
  flex:1;padding:9px 11px;
  border:1px solid #d1d5db;border-radius:8px;
  font-size:13.5px;line-height:1.5;color:#1a1a24;background:#fafaf9;
  resize:none;font-family:inherit;outline:none;
  transition:border-color .15s;max-height:90px;overflow-y:auto;
}
.mzw-input:focus{border-color:${B};}
.mzw-input::placeholder{color:#9ca3af;}
.mzw-send{
  width:36px;height:36px;border-radius:8px;
  background:${C};border:none;cursor:pointer;color:#fff;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:background .15s;
}
.mzw-send:hover:not(:disabled){background:${C}cc;}
.mzw-send:disabled{opacity:.35;cursor:not-allowed;}
.mzw-send svg{width:15px;height:15px;}

.mzw-credit{padding:5px 14px 8px;text-align:center;font-size:10px;color:#c4c9d4;font-family:inherit;}

@media(max-width:400px){
  .mzw-panel{left:8px!important;right:8px!important;width:auto;}
  .mzw-btn{${SIDE}:12px;bottom:12px;}
}`;

  // ── SVG icons ──────────────────────────────────────────────────────────────
  const ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const ICON_X    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  // ── State ──────────────────────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let history   = [];   // actual API message history (no welcome message)

  // ── DOM helpers ────────────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bubbleHTML(role, text) {
    const isUser = role === 'user';
    return `<div class="mzw-msg ${isUser ? 'u' : 'bt'}">
      ${!isUser ? '<div class="mzw-msg-av" aria-hidden="true">m.</div>' : ''}
      <div class="mzw-bubble">${esc(text)}</div>
    </div>`;
  }

  // ── Build & mount widget ───────────────────────────────────────────────────
  function mount() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'mzw-panel mzw';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', cfg.title + ' Chat');
    panel.setAttribute('hidden', '');
    panel.innerHTML = `
      <div class="mzw-head">
        <div class="mzw-av" aria-hidden="true">m.</div>
        <div class="mzw-ht">
          <div class="mzw-ht-name">${esc(cfg.title)}</div>
          <div class="mzw-ht-sub"><div class="mzw-dot"></div>${esc(cfg.subtitle)}</div>
        </div>
        <button class="mzw-xbtn" aria-label="Chat schliessen">${ICON_X}</button>
      </div>
      <div class="mzw-msgs" id="mzw-msgs" role="log" aria-live="polite" aria-label="Chatverlauf">
        ${bubbleHTML('assistant', cfg.welcome)}
      </div>
      <div class="mzw-foot">
        <textarea class="mzw-input" id="mzw-input"
          placeholder="Deine Frage\u2026" rows="1"
          aria-label="Nachricht eingeben"></textarea>
        <button class="mzw-send" id="mzw-send" aria-label="Senden" disabled>${ICON_SEND}</button>
      </div>
      <div class="mzw-credit">mezzo.media \u00B7 KI kann Fehler machen</div>`;

    // Launcher
    const btn = document.createElement('button');
    btn.className = 'mzw-btn mzw';
    btn.setAttribute('aria-label', 'Chat \u00F6ffnen');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mzw-panel');
    btn.innerHTML = ICON_CHAT;
    panel.id = 'mzw-panel';

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    // ── Event wiring ─────────────────────────────────────────────────────────
    const msgs  = panel.querySelector('#mzw-msgs');
    const input = panel.querySelector('#mzw-input');
    const send  = panel.querySelector('#mzw-send');

    function togglePanel() {
      isOpen = !isOpen;
      panel.toggleAttribute('hidden', !isOpen);
      btn.innerHTML = isOpen ? ICON_X : ICON_CHAT;
      btn.setAttribute('aria-label',    isOpen ? 'Chat schliessen' : 'Chat \u00F6ffnen');
      btn.setAttribute('aria-expanded', isOpen ? 'true'            : 'false');
      if (isOpen) setTimeout(() => input.focus(), 50);
    }

    btn.addEventListener('click', togglePanel);
    panel.querySelector('.mzw-xbtn').addEventListener('click', togglePanel);

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 90) + 'px';
      send.disabled = !input.value.trim() || isLoading;
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });

    send.addEventListener('click', doSend);

    // ── Send message ──────────────────────────────────────────────────────────
    async function doSend() {
      const text = input.value.trim();
      if (!text || isLoading) return;

      isLoading        = true;
      input.value      = '';
      input.style.height = 'auto';
      send.disabled    = true;

      history.push({ role: 'user', content: text });
      msgs.insertAdjacentHTML('beforeend', bubbleHTML('user', text));

      // Typing indicator
      const typingId = 'mzw-typing-' + Date.now();
      msgs.insertAdjacentHTML('beforeend', `
        <div class="mzw-msg bt" id="${typingId}">
          <div class="mzw-msg-av" aria-hidden="true">m.</div>
          <div class="mzw-bubble" style="padding:12px 14px;">
            <span class="mzw-td"></span>
            <span class="mzw-td"></span>
            <span class="mzw-td"></span>
          </div>
        </div>`);
      msgs.scrollTop = msgs.scrollHeight;

      try {
        const res = await fetch(cfg.endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ messages: history }),
        });

        let reply;
        if (res.ok) {
          const data = await res.json();
          reply = data.reply || 'Entschuldigung, bitte versuche es erneut.';
        } else {
          const err = await res.json().catch(() => ({}));
          reply = err.error || 'Es ist ein Fehler aufgetreten.';
        }

        document.getElementById(typingId)?.remove();
        history.push({ role: 'assistant', content: reply });
        msgs.insertAdjacentHTML('beforeend', bubbleHTML('assistant', reply));

      } catch {
        document.getElementById(typingId)?.remove();
        const errMsg = 'Netzwerkfehler. Bitte \u00FCberpr\u00FCfe deine Verbindung.';
        history.push({ role: 'assistant', content: errMsg });
        msgs.insertAdjacentHTML('beforeend', bubbleHTML('assistant', errMsg));
      } finally {
        isLoading     = false;
        msgs.scrollTop = msgs.scrollHeight;
      }
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
