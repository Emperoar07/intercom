import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const LIVE_JSON = path.join(__dirname, 'focus-room-live-proof.json');
const LIVE_MD = path.join(__dirname, 'focus-room-live-smoke.md');

const HOST_URL = process.env.FOCUS_HOST_URL || 'ws://127.0.0.1:49222';
const HOST_TOKEN = process.env.FOCUS_HOST_TOKEN || 'localtoken123';
const JOINER_URL = process.env.FOCUS_JOINER_URL || 'ws://127.0.0.1:49223';
const JOINER_TOKEN = process.env.FOCUS_JOINER_TOKEN || 'joinertoken123';
const PROOF_MINUTES_RAW = process.env.FOCUS_PROOF_MINUTES || '1';
const PROOF_MINUTES = (() => {
  const parsed = Number.parseInt(String(PROOF_MINUTES_RAW), 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
})();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch (_e) {
    return String(value);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function getWebSocketCtor() {
  if (typeof WebSocket !== 'undefined') return WebSocket;
  try {
    const wsPkg = require('ws');
    return wsPkg.WebSocket || wsPkg.default || wsPkg;
  } catch (_e) {
    throw new Error('WebSocket is unavailable. Use Node 22+ or install the "ws" package.');
  }
}

function createBridgeClient(name, url, token) {
  const WebSocketCtor = getWebSocketCtor();

  const socket = new WebSocketCtor(url);
  const transcript = [];
  const asyncEvents = [];
  const pending = new Map();
  const waiters = [];

  let nextId = 1;
  let authed = false;

  const closed = new Promise((resolve) => {
    socket.addEventListener('close', () => resolve());
  });

  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${name}: timed out waiting for auth_ok`));
    }, 10000);

    socket.addEventListener('open', () => {
      transcript.push({ at: nowIso(), side: name, dir: 'status', message: 'socket_open' });
    });

    socket.addEventListener('error', (event) => {
      transcript.push({
        at: nowIso(),
        side: name,
        dir: 'status',
        message: 'socket_error',
        detail: safeJson(event?.message || event),
      });
    });

    socket.addEventListener('message', (event) => {
      const text = typeof event.data === 'string' ? event.data : String(event.data);
      let msg = null;
      try {
        msg = JSON.parse(text);
      } catch (_e) {
        transcript.push({ at: nowIso(), side: name, dir: 'recv', raw: text, invalidJson: true });
        return;
      }

      transcript.push({ at: nowIso(), side: name, dir: 'recv', message: msg });

      if (msg.type === 'hello') {
        const authMsg = { type: 'auth', token };
        socket.send(JSON.stringify(authMsg));
        transcript.push({ at: nowIso(), side: name, dir: 'send', message: authMsg });
        return;
      }

      if (msg.type === 'auth_ok') {
        authed = true;
        clearTimeout(timeout);
        resolve();
        return;
      }

      for (let i = waiters.length - 1; i >= 0; i -= 1) {
        const waiter = waiters[i];
        let matched = false;
        try {
          matched = waiter.predicate(msg) === true;
        } catch (_e) {
          matched = false;
        }
        if (!matched) continue;
        clearTimeout(waiter.timeout);
        waiters.splice(i, 1);
        waiter.resolve(msg);
      }

      if (msg.id && pending.has(msg.id)) {
        const settle = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.type === 'error') settle.reject(new Error(msg.error || `${name}: request failed`));
        else settle.resolve(msg);
        return;
      }

      asyncEvents.push(msg);
    });
  });

  const send = (type, payload = {}, timeoutMs = 8000) => {
    if (!authed) {
      return Promise.reject(new Error(`${name}: socket is not authenticated yet`));
    }
    const id = nextId++;
    const message = { id, type, ...payload };
    socket.send(JSON.stringify(message));
    transcript.push({ at: nowIso(), side: name, dir: 'send', message });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${name}: timeout waiting for response to ${type}`));
      }, timeoutMs);
      pending.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        },
      });
    });
  };

  const close = async () => {
    try {
      socket.close();
    } catch (_e) {}
    await Promise.race([closed, wait(500)]);
  };

  const waitFor = (predicate, timeoutMs = 10000) =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const idx = waiters.findIndex((entry) => entry.resolve === resolve);
        if (idx >= 0) waiters.splice(idx, 1);
        reject(new Error(`${name}: timeout waiting for async event`));
      }, timeoutMs);
      waiters.push({ predicate, resolve, reject, timeout });
    });

  return { name, url, ready, send, close, waitFor, transcript, asyncEvents };
}

async function main() {
  const room = `proof-live-${Date.now().toString(36)}`;
  const startAt = nowIso();

  const host = createBridgeClient('host', HOST_URL, HOST_TOKEN);
  const joiner = createBridgeClient('joiner', JOINER_URL, JOINER_TOKEN);

  try {
    await Promise.all([host.ready, joiner.ready]);

    const steps = [];

    const pushStep = async (step, runner) => {
      const at = nowIso();
      const response = await runner();
      steps.push({ step, at, response });
      return response;
    };

    await pushStep('joiner.focus_join', () => joiner.send('focus_join', { room }));
    await wait(350);
    await pushStep('host.focus_start', () =>
      host.send('focus_start', { room, minutes: PROOF_MINUTES, goal: 'live ws timer proof run' })
    );
    await wait(350);
    await pushStep('joiner.focus_checkin', () =>
      joiner.send('focus_checkin', { room, status: 'connected and checking in' })
    );
    await wait(350);
    await pushStep('host.focus_status', () => host.send('focus_status', { room }));
    await wait(350);
    await pushStep('host.focus_rooms', () => host.send('focus_rooms', {}));
    const expiryTimeoutMs = PROOF_MINUTES * 60_000 + 30_000;
    const expiryEvent = await host.waitFor(
      (msg) =>
        msg?.type === 'focus_event' &&
        msg?.eventType === 'session_expired' &&
        msg?.payload?.room === room,
      expiryTimeoutMs
    );
    steps.push({ step: 'host.wait_session_expired', at: nowIso(), response: expiryEvent });
    await pushStep('host.focus_status_after_expiry', () => host.send('focus_status', { room }));
    await wait(350);
    await pushStep('host.focus_streaks', () => host.send('focus_streaks', {}));

    const proof = {
      generatedAt: nowIso(),
      startedAt: startAt,
      room,
      proofMinutes: PROOF_MINUTES,
      endpoints: {
        host: HOST_URL,
        joiner: JOINER_URL,
      },
      steps,
      asyncEvents: {
        host: host.asyncEvents,
        joiner: joiner.asyncEvents,
      },
      transcript: [...host.transcript, ...joiner.transcript].sort((a, b) =>
        a.at < b.at ? -1 : a.at > b.at ? 1 : 0
      ),
    };

    fs.writeFileSync(LIVE_JSON, JSON.stringify(proof, null, 2));

    const md = `# FocusRoom Live WS Proof

## Session
- Generated (UTC): \`${proof.generatedAt}\`
- Room: \`${room}\`
- Host bridge: \`${HOST_URL}\`
- Joiner bridge: \`${JOINER_URL}\`

## Sequence
\`\`\`text
joiner -> focus_join
host   -> focus_start
joiner -> focus_checkin
host   -> focus_status
host   -> focus_rooms
host   -> wait session_expired
host   -> focus_status (after expiry)
host   -> focus_streaks
\`\`\`

## Step Responses
\`\`\`json
${JSON.stringify(steps, null, 2)}
\`\`\`

## Artifact
- \`proof/focus-room-live-proof.json\`
`;

    fs.writeFileSync(LIVE_MD, md);

    console.log('Live proof artifacts regenerated:');
    console.log(`- ${LIVE_JSON}`);
    console.log(`- ${LIVE_MD}`);
  } finally {
    await Promise.allSettled([host.close(), joiner.close()]);
  }
}

main().catch((err) => {
  console.error(`Live proof run failed: ${err?.message || err}`);
  process.exitCode = 1;
});
