import { createFileRoute } from "@tanstack/react-router";

// WidgetVoice public embed script.
// Supports: data-key, data-theme (auto|light|dark), data-position (bottom-right|bottom-left|top-right|top-left),
//           data-lang (en|fr), data-primary (hex color).
const WIDGET_SCRIPT = `(function(){
  var s = document.currentScript;
  if (!s) return;
  var key = s.getAttribute('data-key');
  if (!key) { console.warn('[widgetvoice] missing data-key'); return; }
  var theme = (s.getAttribute('data-theme') || 'auto').toLowerCase();
  var position = (s.getAttribute('data-position') || 'bottom-right').toLowerCase();
  var lang = (s.getAttribute('data-lang') || (navigator.language || 'en').slice(0,2)).toLowerCase();
  var primary = s.getAttribute('data-primary') || '#111111';
  var origin = new URL(s.src).origin;
  var API = origin + '/api/public/feedbacks';

  if (theme === 'auto') {
    theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  var dark = theme === 'dark';
  var T = {
    fr: { btn:'Feedback', title:'Envoyez-nous un feedback', sub:'Ce que vous partagez nous aide à progresser.',
          type_bug:'Bug', type_idea:'Suggestion', type_q:'Question',
          ph:"Décrivez votre retour…", email:'Email (optionnel)', shot:'Joindre une capture',
          send:'Envoyer', sending:'Envoi…', ok:'Merci pour votre retour !', err:'Envoi impossible. Réessayer.',
          need:'Ajoutez un message.' },
    en: { btn:'Feedback', title:'Send us feedback', sub:'What you share helps us improve.',
          type_bug:'Bug', type_idea:'Idea', type_q:'Question',
          ph:"What's on your mind?", email:'Email (optional)', shot:'Attach a screenshot',
          send:'Send', sending:'Sending…', ok:'Thanks for the feedback!', err:'Could not send. Try again.',
          need:'Please add a message.' }
  };
  var L = T[lang === 'fr' ? 'fr' : 'en'];

  var pos = { 'bottom-right':'bottom:20px;right:20px;',
              'bottom-left':'bottom:20px;left:20px;',
              'top-right':'top:20px;right:20px;',
              'top-left':'top:20px;left:20px;' }[position] || 'bottom:20px;right:20px;';
  var panelSide = position.indexOf('left') > -1 ? 'left:0;' : 'right:0;';
  var panelVert = position.indexOf('top') > -1 ? 'top:56px;' : 'bottom:56px;';

  var bg = dark ? '#0f0f10' : '#ffffff';
  var fg = dark ? '#f5f5f5' : '#111111';
  var muted = dark ? '#9a9a9d' : '#666666';
  var border = dark ? '#2a2a2c' : '#e5e7eb';
  var inputBg = dark ? '#1a1a1c' : '#ffffff';

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:2147483647;' + pos;
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });

  root.innerHTML = [
    '<style>',
    ':host,*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.btn{background:', primary, ';color:#fff;border:none;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2);display:inline-flex;align-items:center;gap:6px}',
    '.btn svg{width:14px;height:14px}',
    '.panel{position:absolute;', panelSide, panelVert, 'width:340px;background:', bg, ';color:', fg, ';border:1px solid ', border, ';border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:16px;display:none}',
    '.panel.open{display:block}',
    '.panel h3{margin:0 0 4px;font-size:15px;color:', fg, '}',
    '.sub{margin:0 0 12px;font-size:12px;color:', muted, '}',
    '.types{display:flex;gap:6px;margin-bottom:8px}',
    '.type{flex:1;background:', inputBg, ';color:', fg, ';border:1px solid ', border, ';border-radius:8px;padding:6px 8px;font-size:12px;font-weight:500;cursor:pointer;text-align:center}',
    '.type.on{background:', primary, ';color:#fff;border-color:', primary, '}',
    '.panel textarea{width:100%;min-height:90px;background:', inputBg, ';color:', fg, ';border:1px solid ', border, ';border-radius:10px;padding:10px;font-size:13px;resize:vertical}',
    '.panel input[type=email]{width:100%;background:', inputBg, ';color:', fg, ';border:1px solid ', border, ';border-radius:10px;padding:8px 10px;font-size:13px;margin-top:8px}',
    '.row{display:flex;gap:8px;margin-top:10px;align-items:center;font-size:12px;color:', muted, '}',
    '.send{background:', primary, ';color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto}',
    '.send[disabled]{opacity:.6}',
    '.ok{color:#10b981;font-size:13px;margin-top:8px}',
    '.err{color:#ef4444;font-size:12px;margin-top:8px}',
    '.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}',
    '</style>',
    '<button class="btn" id="wv-toggle" aria-label="', L.btn, '">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      L.btn,
    '</button>',
    '<div class="panel" id="wv-panel" role="dialog" aria-label="', L.title, '">',
    '  <h3>', L.title, '</h3>',
    '  <p class="sub">', L.sub, '</p>',
    '  <div class="types" id="wv-types">',
    '    <button type="button" class="type on" data-t="idea">', L.type_idea, '</button>',
    '    <button type="button" class="type" data-t="bug">', L.type_bug, '</button>',
    '    <button type="button" class="type" data-t="question">', L.type_q, '</button>',
    '  </div>',
    '  <textarea id="wv-msg" placeholder="', L.ph, '"></textarea>',
    '  <input id="wv-email" type="email" placeholder="', L.email, '" autocomplete="email"/>',
    '  <label class="row"><input id="wv-shot" type="checkbox" style="width:auto;margin:0"/> ', L.shot, '</label>',
    '  <input class="hp" id="wv-hp" tabindex="-1" autocomplete="off" aria-hidden="true"/>',
    '  <div class="row"><button class="send" id="wv-send">', L.send, '</button></div>',
    '  <div id="wv-status"></div>',
    '</div>'
  ].join('');

  var $ = function(id){ return root.getElementById(id); };
  var toggle = $('wv-toggle'), panel = $('wv-panel'), msg = $('wv-msg'), email = $('wv-email');
  var shot = $('wv-shot'), send = $('wv-send'), status = $('wv-status'), hp = $('wv-hp');
  var types = root.querySelectorAll('.type');
  var currentType = 'idea';

  toggle.addEventListener('click', function(){ panel.classList.toggle('open'); });
  types.forEach(function(b){
    b.addEventListener('click', function(){
      types.forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      currentType = b.getAttribute('data-t');
    });
  });

  function loadH2C(){
    return new Promise(function(res, rej){
      if (window.html2canvas) return res(window.html2canvas);
      var sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      sc.onload = function(){ res(window.html2canvas); };
      sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }

  send.addEventListener('click', async function(){
    status.textContent = '';
    if (hp.value) return; // honeypot
    var text = (msg.value || '').trim();
    if (!text) { status.className='err'; status.textContent = L.need; return; }
    send.disabled = true; send.textContent = L.sending;
    var screenshot = null;
    try {
      if (shot.checked) {
        panel.style.display = 'none';
        var h2c = await loadH2C();
        var canvas = await h2c(document.body, { logging:false, useCORS:true, scale:0.6 });
        screenshot = canvas.toDataURL('image/jpeg', 0.7);
        panel.style.display = '';
      }
      var text2 = (msg.value || '').trim();
      if (text2.length < 3) { send.disabled=false; send.textContent=L.send; status.className='err'; status.textContent = L.need; return; }
      var res = await fetch(API, {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({
          widget_key: key, message: text2, type: currentType, email: email.value || null,
          page_url: location.href, user_agent: navigator.userAgent,
          screenshot: screenshot, hp: hp.value || null
        })
      });
      if (!res.ok) throw new Error('http '+res.status);
      status.className='ok'; status.textContent = L.ok;
      msg.value=''; email.value=''; shot.checked=false;
      setTimeout(function(){ panel.classList.remove('open'); status.textContent=''; }, 1600);
    } catch(e){
      status.className='err'; status.textContent = L.err;
    } finally {
      send.disabled = false; send.textContent = L.send;
    }
  });
})();`;

export const Route = createFileRoute("/api/public/widget.js")({
  server: {
    handlers: {
      GET: async () =>
        new Response(WIDGET_SCRIPT, {
          headers: {
            "content-type": "application/javascript; charset=utf-8",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        }),
    },
  },
});
