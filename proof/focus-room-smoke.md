# FocusRoom Smoke Run

## Session Metadata
- Date (UTC): `2026-02-26 13:36`
- Runtime: `local simulation (FocusRoom feature module)`
- Primary room: `ship-room`
- Expiry room: `auto-expire-room`

## Command Transcript

```text
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
```

## Captured Output Highlights

```text
[focus:ship-room] started by a1b2c3d4peerhost for 25m 0s | goal="ship focus-room v2"
[focus:ship-room] join a1b2c3d4peerhost
[focus:ship-room] checkin a1b2c3d4peerhost: timer + sc-bridge wired
[focus:ship-room] extended by 5m | new end 2026-02-26T14:06:54.927Z
[focus:ship-room] ended by a1b2c3d4peerhost | actual 0m 0s | participants=1 | checkins=1
[focus:auto-expire-room] started by a1b2c3d4peerhost for 1m 0s | goal="prove expiry"
[focus:auto-expire-room] expired automatically
```

## Evidence Files
- Structured proof output: `proof/focus-room-proof.json`
- Log output: `proof/focus-room-run.log`
- Screenshot/video slot: `proof/focus-room-run.png` or `proof/focus-room-run.mp4`
