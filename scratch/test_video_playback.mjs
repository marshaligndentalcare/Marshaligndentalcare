import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 1500));

const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/', { method: 'PUT' });
const tabData = await newTabRes.json();
const tabWs = tabData.webSocketDebuggerUrl;

const ws = new globalThis.WebSocket(tabWs);
let id = 1;
const send = (method, params = {}) => new Promise((resolve) => {
  const reqId = id++;
  const handler = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id === reqId) {
      ws.removeEventListener('message', handler);
      resolve(msg.result);
    }
  };
  ws.addEventListener('message', handler);
  ws.send(JSON.stringify({ id: reqId, method, params }));
});

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable');

await new Promise(r => setTimeout(r, 1500));
const eval1 = await send('Runtime.evaluate', { expression: 'document.querySelector("video") ? document.querySelector("video").currentTime : -1' });
console.log('Video currentTime at t=1.5s:', eval1.result.value);

await new Promise(r => setTimeout(r, 1500));
const eval2 = await send('Runtime.evaluate', { expression: 'document.querySelector("video") ? document.querySelector("video").currentTime : -1' });
console.log('Video currentTime at t=3.0s:', eval2.result.value);

const evalLoop = await send('Runtime.evaluate', { expression: 'document.querySelector("video") ? document.querySelector("video").loop : false' });
console.log('Video loop attribute:', evalLoop.result.value);

const evalMuted = await send('Runtime.evaluate', { expression: 'document.querySelector("video") ? document.querySelector("video").muted : false' });
console.log('Video muted attribute:', evalMuted.result.value);

ws.close();
chrome.kill();
process.exit(0);
