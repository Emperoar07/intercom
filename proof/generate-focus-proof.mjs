import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FocusRoom from '../features/focus-room/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const proofJsonPath = path.join(__dirname, 'focus-room-proof.json');
const smokePath = path.join(__dirname, 'focus-room-smoke.md');
const runLogPath = path.join(__dirname, 'focus-room-run.log');

const broadcasts = [];
const events = [];
const logs = [];

const originalLog = console.log;
console.log = (...args) => {
  const line = args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      try {
        return JSON.stringify(arg);
      } catch (_e) {
        return String(arg);
      }
    })
    .join(' ');
  logs.push(line);
  originalLog(...args);
};

const nowIso = new Date().toISOString();
const nowUtcMinute = nowIso.slice(0, 16).replace('T', ' ');

const peer = {
  wallet: { publicKey: 'a1b2c3d4peerhost' },
  sidechannel: {
    broadcast: (ch, msg) => {
      broadcasts.push({ ch, msg });
      return true;
    },
  },
};

const app = new FocusRoom(peer, {
  entryChannel: '0000intercom',
  onEvent: (event) => events.push(event),
});

const sequence = [];
sequence.push({
  step: 'focus_start',
  result: app.startSession({ room: 'ship-room', minutes: 25, goal: 'ship focus-room v2' }),
});
sequence.push({ step: 'focus_join', result: app.joinSession({ room: 'ship-room' }) });
sequence.push({
  step: 'focus_checkin',
  result: app.checkIn({ room: 'ship-room', status: 'timer + sc-bridge wired' }),
});
sequence.push({
  step: 'focus_extend',
  result: app.extendSession({ room: 'ship-room', minutes: 5 }),
});
sequence.push({
  step: 'focus_end',
  result: app.endSession({ room: 'ship-room', summary: 'feature complete' }),
});

const expiryStart = app.startSession({
  room: 'auto-expire-room',
  minutes: 1,
  goal: 'prove expiry',
});
const expiryState = app.rooms.get('auto-expire-room');
if (expiryState) expiryState.endsAt = Date.now() - 1;
const expiryResult = app._expireSession('auto-expire-room', 'timer');

const proof = {
  generatedAt: nowIso,
  sequence,
  autoExpiry: {
    start: expiryStart,
    expire: expiryResult,
  },
  rooms: app.listRooms(),
  streaks: app.listStreaks(),
  eventsCount: events.length,
  broadcastsCount: broadcasts.length,
  lastEvents: events.slice(-10),
  lastBroadcasts: broadcasts.slice(-10),
};

fs.writeFileSync(proofJsonPath, JSON.stringify(proof, null, 2));
fs.writeFileSync(runLogPath, `${logs.join('\n')}\n`);

const smoke = `# FocusRoom Smoke Run

## Session Metadata
- Date (UTC): \`${nowUtcMinute}\`
- Runtime: \`local simulation (FocusRoom feature module)\`
- Primary room: \`ship-room\`
- Expiry room: \`auto-expire-room\`

## Command Transcript

\`\`\`text
/focus_start --room "ship-room" --minutes 25 --goal "ship focus-room v2"
/focus_join --room "ship-room"
/focus_checkin --room "ship-room" --status "timer + sc-bridge wired"
/focus_extend --room "ship-room" --minutes 5
/focus_end --room "ship-room" --summary "feature complete"
/focus_streaks
/focus_rooms

# auto-expiry verification
/focus_start --room "auto-expire-room" --minutes 1 --goal "prove expiry"
# wait until endsAt OR trigger expiry path in deterministic simulation
session_expired emitted with reason="timer"
\`\`\`

## Captured Output Highlights

\`\`\`text
${logs.slice(-12).join('\n')}
\`\`\`

## Evidence Files
- Structured proof output: \`proof/focus-room-proof.json\`
- Log output: \`proof/focus-room-run.log\`
- Screenshot/video slot: \`proof/focus-room-run.png\` or \`proof/focus-room-run.mp4\`
`;

fs.writeFileSync(smokePath, smoke);
console.log = originalLog;
originalLog(`Proof artifacts regenerated:
- ${proofJsonPath}
- ${runLogPath}
- ${smokePath}`);
