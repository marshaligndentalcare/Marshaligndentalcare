
import fs from 'fs';

async function main() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const page = targets.find(t => t.url.includes('extract_frame.html'));
  if (!page) {
    console.error('Page target not found');
    return;
  }

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

  // Wait a moment for video seek & canvas draw
  await new Promise(r => setTimeout(r, 2000));

  const evalResult = await send('Runtime.evaluate', {
    expression: 'JSON.stringify(window.__FRAME_DATA__)',
    returnByValue: true
  });
  console.log('FRAME DATA:', evalResult?.result?.value);

  const imgResult = await send('Runtime.evaluate', {
    expression: 'window.__FRAME_DATA_URL__',
    returnByValue: true
  });

  if (imgResult?.result?.value) {
    const base64Data = imgResult.result.value.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('scratch/extracted_frame.png', Buffer.from(base64Data, 'base64'));
    console.log('Saved scratch/extracted_frame.png!');
  }

  ws.close();
}

main().catch(console.error);
