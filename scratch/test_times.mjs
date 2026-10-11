import fs from 'fs';

async function main() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const page = targets.find(t => t.url.includes('extract_frame.html'));
  if (!page) return;

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

  for (let t of [0, 2.5, 5.0, 7.5]) {
    await send('Runtime.evaluate', {
      expression: `new Promise(r => { v.currentTime = ${t}; v.onseeked = () => { ctx.drawImage(v, 0, 0); r(c.toDataURL('image/png')); }; })`,
      awaitPromise: true,
      returnByValue: true
    }).then(res => {
      if (res?.result?.value) {
        const base64Data = res.result.value.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(`scratch/frame_${t}.png`, Buffer.from(base64Data, 'base64'));
        console.log(`Saved scratch/frame_${t}.png`);
      }
    });
  }
  ws.close();
}
main().catch(console.error);
