import fs from 'fs';
async function main() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const page = targets.find(t => t.url === 'http://localhost:5173/' || t.title.includes('Marshalign'));
  if (!page) { console.error('Target not found', targets); return; }

  const ws = new globalThis.WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r));

  // Wait 2s for animations
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:/Users/New/.gemini/antigravity-ide/brain/4750af30-e608-46cf-907d-b59330db5b30/hero_final_clean.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved hero_final_clean.png');
  }
  ws.close();
}
main().catch(console.error);
