import { createFileRoute } from "@tanstack/react-router";

const WIDGET_SCRIPT = `(function(){
  var s = document.currentScript;
  var key = s && s.getAttribute('data-key');
  if (!key) { console.warn('[widgetvoice] missing data-key'); return; }
  var origin = new URL(s.src).origin;
  var API = origin + '/api/public/feedbacks';

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:2147483647;bottom:20px;right:20px;';
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });

  root.innerHTML = [
    '<style>',
    ':host,*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.btn{background:#111;color:#fff;border:none;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2)}',
    '.panel{position:absolute;bottom:56px;right:0;width:320px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:16px;display:none}',
    '.panel.open{display:block}',
    '.panel h3{margin:0 0 10px;font-size:15px;color:#111}',
    '.panel textarea{width:100%;min-height:90px;border:1px solid #e5e7eb;border-radius:10px;padding:10px;font-size:13px;resize:vertical;color:#111}',
    '.panel input{width:100%;border:1px solid #e5e7eb;border-radius:10px;padding:8px 10px;font-size:13px;margin-top:8px;color:#111}',
    '.row{display:flex;gap:8px;margin-top:10px;align-items:center;font-size:12px;color:#555}',
    '.send{background:#111;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto}',
    '.send[disabled]{opacity:.6}',
    '.ok{color:#059669;font-size:13px;margin-top:8px}',
    '.err{color:#b91c1c;font-size:12px;margin-top:8px}',
    '</style>',
    '<button class="btn" id="wv-toggle">💬 Feedback</button>',
    '<div class="panel" id="wv-panel">',
    '  <h3>Send us feedback</h3>',
    '  <textarea id="wv-msg" placeholder="What\\'s on your mind?"></textarea>',
    '  <input id="wv-email" type="email" placeholder="Email (optional)"/>',
    '  <label class="row"><input id="wv-shot" type="checkbox" style="width:auto;margin:0"/> Attach screenshot</label>',
    '  <div class="row"><button class="send" id="wv-send">Send</button></div>',
    '  <div id="wv-status"></div>',
    '</div>'
  ].join('');

  var toggle = root.getElementById('wv-toggle');
  var panel = root.getElementById('wv-panel');
  var msg = root.getElementById('wv-msg');
  var email = root.getElementById('wv-email');
  var shot = root.getElementById('wv-shot');
  var send = root.getElementById('wv-send');
  var status = root.getElementById('wv-status');

  toggle.addEventListener('click', function(){ panel.classList.toggle('open'); });

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
    var text = (msg.value || '').trim();
    if (!text) { status.className='err'; status.textContent='Please add a message.'; return; }
    send.disabled = true; send.textContent = 'Sending…';
    var screenshot = null;
    try {
      if (shot.checked) {
        panel.style.display = 'none';
        var h2c = await loadH2C();
        var canvas = await h2c(document.body, { logging:false, useCORS:true, scale:0.6 });
        screenshot = canvas.toDataURL('image/jpeg', 0.7);
        panel.style.display = '';
      }
      var res = await fetch(API, {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({
          widget_key: key, message: text, email: email.value || null,
          page_url: location.href, user_agent: navigator.userAgent,
          screenshot: screenshot
        })
      });
      if (!res.ok) throw new Error('http '+res.status);
      status.className='ok'; status.textContent='Thanks for the feedback!';
      msg.value=''; email.value=''; shot.checked=false;
      setTimeout(function(){ panel.classList.remove('open'); status.textContent=''; }, 1600);
    } catch(e){
      status.className='err'; status.textContent='Could not send. Try again.';
    } finally {
      send.disabled = false; send.textContent = 'Send';
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
