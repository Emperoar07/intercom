# FocusRoom Live WS Proof

## Session
- Generated (UTC): `2026-02-26T13:51:42.953Z`
- Room: `proof-live-mm3itrd7`
- Host bridge: `ws://127.0.0.1:49222`
- Joiner bridge: `ws://127.0.0.1:49223`

## Sequence
```text
joiner -> focus_join
host   -> focus_start
joiner -> focus_checkin
host   -> focus_status
host   -> focus_rooms
host   -> wait session_expired
host   -> focus_status (after expiry)
host   -> focus_streaks
```

## Step Responses
```json
[
  {
    "step": "joiner.focus_join",
    "at": "2026-02-26T13:50:41.836Z",
    "response": {
      "id": 1,
      "type": "focus_joined",
      "room": {
        "room": "proof-live-mm3itrd7",
        "host": null,
        "goal": "",
        "startedAt": null,
        "endsAt": null,
        "lastEventAt": 1772113841837,
        "status": "idle",
        "endedAt": null,
        "endedReason": null,
        "participants": [
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de"
        ],
        "checkins": [],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_start",
    "at": "2026-02-26T13:50:42.440Z",
    "response": {
      "id": 1,
      "type": "focus_started",
      "room": {
        "room": "proof-live-mm3itrd7",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws timer proof run",
        "startedAt": 1772113842441,
        "endsAt": 1772113902441,
        "lastEventAt": 1772113842441,
        "status": "active",
        "endedAt": null,
        "endedReason": null,
        "participants": [
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2"
        ],
        "checkins": [],
        "stats": null
      }
    }
  },
  {
    "step": "joiner.focus_checkin",
    "at": "2026-02-26T13:50:42.824Z",
    "response": {
      "id": 2,
      "type": "focus_checked_in",
      "room": {
        "room": "proof-live-mm3itrd7",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws timer proof run",
        "startedAt": 1772113842441,
        "endsAt": 1772113902441,
        "lastEventAt": 1772113842825,
        "status": "active",
        "endedAt": null,
        "endedReason": null,
        "participants": [
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2"
        ],
        "checkins": [
          {
            "who": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
            "at": 1772113842825,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_status",
    "at": "2026-02-26T13:50:43.186Z",
    "response": {
      "id": 2,
      "type": "focus_status",
      "room": {
        "room": "proof-live-mm3itrd7",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws timer proof run",
        "startedAt": 1772113842441,
        "endsAt": 1772113902441,
        "lastEventAt": 1772113842825,
        "status": "active",
        "endedAt": null,
        "endedReason": null,
        "participants": [
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de"
        ],
        "checkins": [
          {
            "who": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
            "at": 1772113842825,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_rooms",
    "at": "2026-02-26T13:50:43.552Z",
    "response": {
      "id": 3,
      "type": "focus_rooms",
      "rooms": [
        {
          "room": "proof-room",
          "status": "ended",
          "participants": 2,
          "goal": "capture browser proof",
          "endsAt": 1772115023065
        },
        {
          "room": "proof-live-mm3efll4",
          "status": "ended",
          "participants": 2,
          "goal": "live ws proof run",
          "endsAt": 1772108263256
        },
        {
          "room": "proof-room200",
          "status": "ended",
          "participants": 2,
          "goal": "capture browser proof",
          "endsAt": 1772111070183
        },
        {
          "room": "proof-live-mm3iaycw",
          "status": "ended",
          "participants": 2,
          "goal": "live ws proof run",
          "endsAt": 1772114764923
        },
        {
          "room": "proof-live-mm3itrd7",
          "status": "active",
          "participants": 2,
          "goal": "live ws timer proof run",
          "endsAt": 1772113902441
        }
      ]
    }
  },
  {
    "step": "host.wait_session_expired",
    "at": "2026-02-26T13:51:42.576Z",
    "response": {
      "type": "focus_event",
      "app": "focus_room",
      "eventType": "session_expired",
      "payload": {
        "room": "proof-live-mm3itrd7",
        "who": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "reason": "timer",
        "at": 1772113902443,
        "stats": {
          "plannedDurationMs": 60000,
          "actualDurationMs": 60002,
          "participantCount": 2,
          "checkinCount": 1
        }
      },
      "at": 1772113902443,
      "by": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
      "source": "local"
    }
  },
  {
    "step": "host.focus_status_after_expiry",
    "at": "2026-02-26T13:51:42.576Z",
    "response": {
      "id": 4,
      "type": "focus_status",
      "room": {
        "room": "proof-live-mm3itrd7",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws timer proof run",
        "startedAt": 1772113842441,
        "endsAt": 1772113902441,
        "lastEventAt": 1772113902456,
        "status": "ended",
        "endedAt": 1772113902456,
        "endedReason": "timer",
        "participants": [
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de"
        ],
        "checkins": [
          {
            "who": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
            "at": 1772113842825,
            "status": "connected and checking in"
          }
        ],
        "stats": {
          "plannedDurationMs": 60000,
          "actualDurationMs": 60015,
          "participantCount": 2,
          "checkinCount": 1
        }
      }
    }
  },
  {
    "step": "host.focus_streaks",
    "at": "2026-02-26T13:51:42.949Z",
    "response": {
      "id": 5,
      "type": "focus_streaks",
      "streaks": [
        {
          "peer": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "sessions": 28
        },
        {
          "peer": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
          "sessions": 28
        }
      ]
    }
  }
]
```

## Artifact
- `proof/focus-room-live-proof.json`
