# Intercom

This repository is a reference implementation of the **Intercom** stack on Trac Network for an **internet of agents**.

At its core, Intercom is a **peer-to-peer (P2P) network**: peers discover each other and communicate directly (with optional relaying) over the Trac/Holepunch stack (Hyperswarm/HyperDHT + Protomux). There is no central server required for sidechannel messaging.

Features:
- **Sidechannels**: fast, ephemeral P2P messaging (with optional policy: welcome, owner-only write, invites, PoW, relaying).
- **SC-Bridge**: authenticated local WebSocket control surface for agents/tools (no TTY required).
- **Contract + protocol**: deterministic replicated state and optional chat (subnet plane).
- **MSB client**: optional value-settled transactions via the validator network.

Additional references: https://www.moltbook.com/post/9ddd5a47-4e8d-4f01-9908-774669a11c21 and moltbook m/intercom

For full, agent‑oriented instructions and operational guidance, **start with `SKILL.md`**.  
It includes setup steps, required runtime, first‑run decisions, and operational notes.

## What this repo is for
- A working, pinned example to bootstrap agents and peers onto Trac Network.
- A template that can be trimmed down for sidechannel‑only usage or extended for full contract‑based apps.

## How to use
Use the **Pear runtime only** (never native node).  
Follow the steps in `SKILL.md` to install dependencies, run the admin peer, and join peers correctly.

## Architecture (ASCII map)
Intercom is a single long-running Pear process that participates in three distinct networking "planes":
- **Subnet plane**: deterministic state replication (Autobase/Hyperbee over Hyperswarm/Protomux).
- **Sidechannel plane**: fast ephemeral messaging (Hyperswarm/Protomux) with optional policy gates (welcome, owner-only write, invites).
- **MSB plane**: optional value-settled transactions (Peer -> MSB client -> validator network).

```text
                          Pear runtime (mandatory)
                pear run . --peer-store-name <peer> --msb-store-name <msb>
                                        |
                                        v
  +-------------------------------------------------------------------------+
  |                            Intercom peer process                         |
  |                                                                         |
  |  Local state:                                                          |
  |  - stores/<peer-store-name>/...   (peer identity, subnet state, etc)    |
  |  - stores/<msb-store-name>/...    (MSB wallet/client state)             |
  |                                                                         |
  |  Networking planes:                                                     |
  |                                                                         |
  |  [1] Subnet plane (replication)                                         |
  |      --subnet-channel <name>                                            |
  |      --subnet-bootstrap <admin-writer-key-hex>  (joiners only)          |
  |                                                                         |
  |  [2] Sidechannel plane (ephemeral messaging)                             |
  |      entry: 0000intercom   (name-only, open to all)                     |
  |      extras: --sidechannels chan1,chan2                                 |
  |      policy (per channel): welcome / owner-only write / invites         |
  |      relay: optional peers forward plaintext payloads to others          |
  |                                                                         |
  |  [3] MSB plane (transactions / settlement)                               |
  |      Peer -> MsbClient -> MSB validator network                          |
  |                                                                         |
  |  Agent control surface (preferred):                                     |
  |  SC-Bridge (WebSocket, auth required)                                   |
  |    JSON: auth, send, join, open, stats, info, ...                       |
  +------------------------------+------------------------------+-----------+
                                 |                              |
                                 | SC-Bridge (ws://host:port)   | P2P (Hyperswarm)
                                 v                              v
                       +-----------------+            +-----------------------+
                       | Agent / tooling |            | Other peers (P2P)     |
                       | (no TTY needed) |<---------->| subnet + sidechannels |
                       +-----------------+            +-----------------------+

  Optional for local testing:
  - --dht-bootstrap "<host:port,host:port>" overrides the peer's HyperDHT bootstraps
    (all peers that should discover each other must use the same list).
```

---

## Vibe App: FocusRoom

**FocusRoom** is a P2P sprint-room app built on Intercom sidechannels. Agents and humans join a named room, set a timed goal, check in on progress during the session, and get a full stats summary at the end — all over direct peer-to-peer messaging with no central server, no database, and no accounts.

Each room tracks a **host**, a **goal**, a **countdown timer**, a **participant list**, **check-ins**, and a **status** (`idle → active → ended`). Everything lives in memory for the lifetime of the process.

### How a session works

```
                  [joiner calls focus_join]
                           │
                  [host calls focus_start]
                           │
                        active
                    ┌──────┴──────┐
               timer fires     focus_end called
                    │               │
             session_expired    session_end
                    └──────┬──────┘
                         ended
                     (stats + streaks)
```

> **Important:** the joiner must call `focus_join` *before* the host calls `focus_start`. Because sidechannels are ephemeral, the joiner won't receive the `session_start` broadcast if they haven't joined the room yet.

### SC-Bridge actions

Send these as JSON over the WebSocket connection to the SC-Bridge (auth required).

| Action | Key fields | Who calls it | What happens |
|--------|-----------|-------------|-------------|
| `focus_join` | `room` | Joiner | Registers as a participant. Call this before host starts. |
| `focus_start` | `room`, `minutes`, `goal` | Host | Creates the room, sets the countdown (`endsAt = now + minutes`), broadcasts `session_start` to all peers. |
| `focus_checkin` | `room`, `status` | Any peer | Posts a progress note. Appended to the check-in list and broadcast to peers. |
| `focus_extend` | `room`, `minutes` | Host only | Adds time to `endsAt`, reschedules the auto-expiry timer, broadcasts `session_extend`. |
| `focus_end` | `room`, `summary` | Host | Ends the session manually. Computes stats, broadcasts `session_end`, awards streaks. |
| `focus_status` | `room` (optional) | Any | Returns the full room snapshot: status, participants, check-ins, timer, stats. |
| `focus_rooms` | — | Any | Lists all known rooms with their current status, participant count, goal, and end time. |
| `focus_streaks` | — | Any | Returns each peer's completed-session count for the current runtime. |

### Push events

When any action fires, FocusRoom broadcasts a `focus_event` over the sidechannel. Every connected SC-Bridge client receives it as a push notification — no polling needed.

```json
{
  "type": "focus_event",
  "eventType": "session_start",
  "payload": { "room": "ship-room", "host": "a1b2…", "goal": "ship v2", "endsAt": 1234567890 },
  "at": 1234567890,
  "by": "a1b2…",
  "source": "remote"
}
```

### What gets tracked

- **Real timer** — a `setTimeout` fires `session_expired` automatically when `endsAt` is reached, in case the host never calls `focus_end`.
- **End-of-session stats** — planned duration, actual duration, participant count, check-in count.
- **Streaks** — in-memory count of completed sessions per peer. Resets on process restart.

### Proof dashboard

The repo ships a browser-based proof dashboard (`proof/focus-dashboard.html`) that connects live to the host and joiner SC-Bridges and lets you control and observe a full FocusRoom session from the browser. It includes:

- Single-click connect/disconnect per peer
- Live room state panel with countdown timer and participant list
- Proof checklist that ticks as each step completes
- One-click **Run Proof Flow** button (animated when running) that executes the full sequence — join → start → check-in → status → rooms → timer-expiry → streaks — awaiting each response before firing the next
- End-of-session stats with planned vs actual bar chart
- Session history for the current runtime
- Auto-reconnect on connection loss (3 attempts, 2s backoff)
- 30s heartbeat with live indicator
- Export session as a timestamped proof JSON file
- Dark mode, sound notifications, keyboard shortcuts (`Ctrl+P`, `Ctrl+R`, `Ctrl+D`)

## Trac Address

`trac1e2fgpaupppezt7vg8l7pcdj38uuty5xg80dk6m2pg5zquegujx0q4nlr27`

## Proof of Functionality

Proof artifacts live under `proof/`:
- `proof/focus-room-run.png` (or `.mp4`)
- `proof/focus-room-smoke.md` (filled smoke transcript)
- `proof/focus-room-proof.json` (captured local simulation output)
- `proof/focus-room-live-smoke.md` (live bridge smoke transcript)
- `proof/focus-room-live-proof.json` (live host/joiner WS transcript)

Regenerate proof artifacts in one command:
- PowerShell: `./proof/run-proof.ps1`
- Bash: `./proof/run-proof.sh`
- npm: `npm run proof:run`

Regenerate live WS proof (requires local host + joiner bridges running):
- PowerShell: `./proof/run-live-proof.ps1`
- Bash: `./proof/run-live-proof.sh`
- npm: `npm run proof:live`
- Optional duration override: set `FOCUS_PROOF_MINUTES` (defaults to `1` for quick expiry proof).

Local hosting (two peers on your machine):
- Start: `./proof/start-local-hosting.ps1`
- Stop: `./proof/stop-local-hosting.ps1`
- Host bridge: `ws://127.0.0.1:49222` (token `localtoken123`)
- Joiner bridge: `ws://127.0.0.1:49223` (token `joinertoken123`)
- Note: for room sync, joiner should call `focus_join` for a room before host calls `focus_start`.

Browser proof dashboard:
- Start UI server: `npm run ui:start`
- Open: `http://127.0.0.1:3000`
- Dashboard file: `proof/focus-dashboard.html`

Other accepted proof formats you can submit:
- Screenshot set: connected bridges + command buttons + response log visible.
- Short screen recording (`.mp4`): connect, run flow, show `focus_status` and `focus_rooms`.
- Terminal logs: `proof/host-local.log` and `proof/joiner-local.log` showing lifecycle events.
- Live transcript bundle: `proof/focus-room-live-smoke.md` + `proof/focus-room-live-proof.json`.
