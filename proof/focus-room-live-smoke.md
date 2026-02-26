# FocusRoom Live WS Proof

## Session
- Generated (UTC): `2026-02-26T13:36:07.300Z`
- Room: `proof-live-mm3iaycw`
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
    "at": "2026-02-26T13:36:04.398Z",
    "response": {
      "id": 1,
      "type": "focus_joined",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": null,
        "goal": "",
        "startedAt": null,
        "endsAt": null,
        "lastEventAt": 1772112964401,
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
    "at": "2026-02-26T13:36:04.921Z",
    "response": {
      "id": 1,
      "type": "focus_started",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772112964923,
        "endsAt": 1772114464923,
        "lastEventAt": 1772112964923,
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
    "at": "2026-02-26T13:36:05.382Z",
    "response": {
      "id": 2,
      "type": "focus_checked_in",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772112964923,
        "endsAt": 1772114464923,
        "lastEventAt": 1772112965384,
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
            "at": 1772112965384,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_extend",
    "at": "2026-02-26T13:36:05.816Z",
    "response": {
      "id": 2,
      "type": "focus_extended",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772112964923,
        "endsAt": 1772114764923,
        "lastEventAt": 1772112965818,
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
            "at": 1772112965384,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_status",
    "at": "2026-02-26T13:36:06.181Z",
    "response": {
      "id": 3,
      "type": "focus_status",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772112964923,
        "endsAt": 1772114764923,
        "lastEventAt": 1772112965818,
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
            "at": 1772112965384,
            "status": "connected and checking in"
          }
        ],
        "stats": null
      }
    }
  },
  {
    "step": "host.focus_rooms",
    "at": "2026-02-26T13:36:06.538Z",
    "response": {
      "id": 4,
      "type": "focus_rooms",
      "rooms": [
        {
          "room": "proof-room",
          "status": "active",
          "participants": 2,
          "goal": "capture browser proof",
          "endsAt": 1772114212087
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
          "status": "active",
          "participants": 2,
          "goal": "live ws proof run",
          "endsAt": 1772114764923
        }
      ]
    }
  },
  {
    "step": "host.focus_end",
    "at": "2026-02-26T13:36:06.895Z",
    "response": {
      "id": 5,
      "type": "focus_ended",
      "room": {
        "room": "proof-live-mm3iaycw",
        "host": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
        "goal": "live ws proof run",
        "startedAt": 1772112964923,
        "endsAt": 1772114764923,
        "lastEventAt": 1772112966897,
        "status": "ended",
        "endedAt": 1772112966897,
        "endedReason": "manual",
        "participants": [
          "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de"
        ],
        "checkins": [
          {
            "who": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
            "at": 1772112965384,
            "status": "connected and checking in"
          }
        ],
        "stats": {
          "plannedDurationMs": 1800000,
          "actualDurationMs": 1974,
          "participantCount": 2,
          "checkinCount": 1
        }
      },
      "stats": {
        "plannedDurationMs": 1800000,
        "actualDurationMs": 1974,
        "participantCount": 2,
        "checkinCount": 1
      }
    }
  },
  {
    "step": "host.focus_streaks",
    "at": "2026-02-26T13:36:07.298Z",
    "response": {
      "id": 6,
      "type": "focus_streaks",
      "streaks": [
        {
          "peer": "d848bf12e6fd277a8c5cdcf5f42a4ea723e8ece102c277d1218783219c8c91e2",
          "sessions": 7
        },
        {
          "peer": "4978f9d9a634cdb5c02c5276b13fb547b8845832fa77323fc6352639e4b967de",
          "sessions": 7
        }
      ]
    }
  }
]
```

## Artifact
- `proof/focus-room-live-proof.json`
