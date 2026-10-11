import http from 'http';
import fs from 'fs';
import { spawn } from 'child_process';

// Launch chrome headless and take screenshot
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 1500));

// Connect to CDP
const versionRes = await fetch('http://127.0.0.1:9222/json/version');
const versionData = await versionRes.json();
const wsEndpoint = versionData.webSocketDebuggerUrl;

// Or use simple HTTP target create
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
await send('Network.enable');

// Wait for load
await new Promise(r => setTimeout(r, 2000));

const screenshot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync('scratch/live_hero_check.png', Buffer.from(screenshot.data, 'base64'));
console.log('Saved live hero screenshot to scratch/live_hero_check.png');

ws.close();
chrome.kill();
process.exit(0);
