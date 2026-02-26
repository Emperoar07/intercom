# FocusRoom Live WS Proof

## Session
- Generated (UTC): `2026-02-26T11:47:46.200Z`
- Room: `proof-live-mm3efll4`
- Host bridge: `ws://127.0.0.1:49222`
- Joiner bridge: `ws://127.0.0.1:49223`

## Sequence
```text
joiner -> focus_join
host   -> focus_start
joiner -> focus_checkin
host   -> focus_extend
host   -> focus_status
host   -> focus_rooms
host   -> focus_end
host   -> focus_streaks
```

## Step Responses
```json
[
  {
    "step": "joiner.focus_join",
    "at": "2026-02-26T11:47:42.681Z",
    "response": {
      "id": 1,
      "type": "focus_joined",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": null,
        "goal": "",
        "startedAt": null,
        "endsAt": null,
        "lastEventAt": 1772106462689,
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
    "at": "2026-02-26T11:47:43.249Z",
    "response": {
      "id": 1,
      "type": "focus_started",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772106463256,
        "endsAt": 1772107963256,
        "lastEventAt": 1772106463256,
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
    "at": "2026-02-26T11:47:44.097Z",
    "response": {
      "id": 2,
      "type": "focus_checked_in",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772106463256,
        "endsAt": 1772107963256,
        "lastEventAt": 1772106464103,
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
            "at": 1772106464103,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_extend",
    "at": "2026-02-26T11:47:44.531Z",
    "response": {
      "id": 2,
      "type": "focus_extended",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772106463256,
        "endsAt": 1772108263256,
        "lastEventAt": 1772106464538,
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
            "at": 1772106464103,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_status",
    "at": "2026-02-26T11:47:44.981Z",
    "response": {
      "id": 3,
      "type": "focus_status",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772106463256,
        "endsAt": 1772108263256,
        "lastEventAt": 1772106464538,
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
            "at": 1772106464103,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_rooms",
    "at": "2026-02-26T11:47:45.334Z",
    "response": {
      "id": 4,
      "type": "focus_rooms",
      "rooms": [
        {
          "room": "proof-room",
          "status": "active",
          "participants": 1,
          "goal": "capture browser proof",
          "endsAt": 1772107518146
        },
        {
          "room": "proof-live-mm3efll4",
          "status": "active",
          "participants": 2,
          "goal": "live ws proof run",
          "endsAt": 1772108263256
        }
      ]
    }
  },
  {
    "step": "host.focus_end",
    "at": "2026-02-26T11:47:45.697Z",
    "response": {
      "id": 5,
      "type": "focus_ended",
      "room": {
        "room": "proof-live-mm3efll4",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772106463256,
        "endsAt": 1772108263256,
        "lastEventAt": 1772106465704,
        "status": "ended",
        "endedAt": 1772106465704,
        "endedReason": "manual",
        "participants": [
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de"
        ],
        "checkins": [
          {
            "who": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
            "at": 1772106464103,
            "status": "connected and checking in"
          }
        ],
        "stats": {
          "plannedDurationMs": 1800000,
          "actualDurationMs": 2448,
          "participantCount": 2,
          "checkinCount": 1
        }
      },
      "stats": {
        "plannedDurationMs": 1800000,
        "actualDurationMs": 2448,
        "participantCount": 2,
        "checkinCount": 1
      }
    }
  },
  {
    "step": "host.focus_streaks",
    "at": "2026-02-26T11:47:46.197Z",
    "response": {
      "id": 6,
      "type": "focus_streaks",
      "streaks": [
        {
          "peer": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "sessions": 1
        },
        {
          "peer": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
          "sessions": 1
        }
      ]
    }
  }
]
```

## Artifact
- `proof/focus-room-live-proof.json`
