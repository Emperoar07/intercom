class FocusRoom {
  constructor(peer, options = {}) {
    this.peer = peer;
    this.entryChannel = options.entryChannel || '0000intercom';
    this.rooms = new Map();
    this.timers = new Map();
    this.streaks = new Map();
    this.onEvent = typeof options.onEvent === 'function' ? options.onEvent : null;
  }

  _now() {
    return Date.now();
  }

  _selfKey() {
    return this.peer?.wallet?.publicKey ? String(this.peer.wallet.publicKey).toLowerCase() : 'unknown';
  }

  _upsertRoom(room) {
    const key = String(room || '').trim();
    if (!key) return null;
    if (!this.rooms.has(key)) {
      this.rooms.set(key, {
        room: key,
        host: null,
        goal: '',
        startedAt: null,
        endsAt: null,
        lastEventAt: null,
        status: 'idle',
        endedAt: null,
        endedReason: null,
        participants: new Set(),
        checkins: [],
        stats: null,
        streakAwarded: false,
      });
    }
    return this.rooms.get(key);
  }

  _formatMs(ms) {
    const clamped = Math.max(0, Number(ms) || 0);
    const totalSec = Math.floor(clamped / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}m ${seconds}s`;
  }

  _safeIso(ts) {
    if (!Number.isFinite(ts)) return 'unknown';
    try {
      return new Date(ts).toISOString();
    } catch (_e) {
      return 'unknown';
    }
  }

  _emit(eventType, payload, meta = {}) {
    const entry = {
      app: 'focus_room',
      eventType,
      payload,
      at: Number.isFinite(meta.at) ? meta.at : this._now(),
      by: meta.by || this._selfKey(),
      source: meta.source || 'local',
    };
    if (this.onEvent) this.onEvent(entry);
    const room = payload?.room || 'unknown';
    if (eventType === 'session_start') {
      console.log(
        `[focus:${room}] started by ${payload.host} for ${this._formatMs(
          (payload.endsAt || 0) - (payload.startedAt || 0)
        )} | goal="${payload.goal || ''}"`
      );
    } else if (eventType === 'session_join') {
      console.log(`[focus:${room}] join ${payload.who}`);
    } else if (eventType === 'session_checkin') {
      console.log(`[focus:${room}] checkin ${payload.who}: ${payload.status}`);
    } else if (eventType === 'session_extend') {
      console.log(
        `[focus:${room}] extended by ${payload.minutes}m | new end ${this._safeIso(payload.endsAt)}`
      );
    } else if (eventType === 'session_expired') {
      console.log(`[focus:${room}] expired automatically`);
    } else if (eventType === 'session_end') {
      console.log(
        `[focus:${room}] ended by ${payload.who} | actual ${this._formatMs(
          payload.stats?.actualDurationMs || 0
        )} | participants=${payload.stats?.participantCount ?? 0} | checkins=${payload.stats?.checkinCount ?? 0}`
      );
    }
    return entry;
  }

  _toMessage(eventType, payload = {}, at = null) {
    return {
      app: 'focus_room',
      eventType,
      payload,
      at: Number.isFinite(at) ? at : this._now(),
      by: this._selfKey(),
    };
  }

  _broadcast(channel, eventType, payload = {}, at = null) {
    if (!this.peer?.sidechannel) return false;
    return this.peer.sidechannel.broadcast(
      channel || this.entryChannel,
      this._toMessage(eventType, payload, at)
    );
  }

  _computeStats(roomState, endedAt) {
    const startedAt = Number.isFinite(roomState.startedAt) ? roomState.startedAt : endedAt;
    const endsAt = Number.isFinite(roomState.endsAt) ? roomState.endsAt : endedAt;
    const plannedDurationMs = Math.max(0, endsAt - startedAt);
    const actualDurationMs = Math.max(0, endedAt - startedAt);
    return {
      plannedDurationMs,
      actualDurationMs,
      participantCount: roomState.participants.size,
      checkinCount: roomState.checkins.length,
    };
  }

  _clearTimer(room) {
    const key = String(room || '').trim();
    const existing = this.timers.get(key);
    if (existing) clearTimeout(existing);
    this.timers.delete(key);
  }

  _scheduleExpiry(roomState) {
    this._clearTimer(roomState.room);
    if (roomState.status !== 'active' || !Number.isFinite(roomState.endsAt)) return;
    const delayMs = roomState.endsAt - this._now();
    if (delayMs <= 0) {
      this._expireSession(roomState.room, 'timer');
      return;
    }
    const handle = setTimeout(() => {
      this._expireSession(roomState.room, 'timer');
    }, delayMs);
    this.timers.set(roomState.room, handle);
  }

  _awardStreak(roomState) {
    if (!roomState || roomState.streakAwarded) return;
    for (const who of roomState.participants.values()) {
      const prev = this.streaks.get(who) || 0;
      this.streaks.set(who, prev + 1);
    }
    roomState.streakAwarded = true;
  }

  _applySessionStart(roomState, data, at) {
    roomState.host = String(data.host || roomState.host || '').toLowerCase();
    roomState.goal = String(data.goal || '').slice(0, 240);
    roomState.startedAt = Number.isFinite(data.startedAt) ? data.startedAt : at;
    roomState.endsAt = Number.isFinite(data.endsAt) ? data.endsAt : null;
    roomState.lastEventAt = at;
    roomState.status = 'active';
    roomState.endedAt = null;
    roomState.endedReason = null;
    roomState.stats = null;
    roomState.streakAwarded = false;
    if (roomState.host) roomState.participants.add(roomState.host);
    this._scheduleExpiry(roomState);
  }

  _applySessionEnd(roomState, data, at, reason) {
    roomState.status = 'ended';
    roomState.endedAt = at;
    roomState.endedReason = reason;
    roomState.lastEventAt = at;
    roomState.stats =
      data?.stats && typeof data.stats === 'object' ? data.stats : this._computeStats(roomState, at);
    this._clearTimer(roomState.room);
    this._awardStreak(roomState);
  }

  _expireSession(room, reason = 'timer') {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    if (roomState.status !== 'active') return { ok: false, error: 'room is not active' };
    const at = this._now();
    const stats = this._computeStats(roomState, at);
    this._applySessionEnd(roomState, { stats }, at, reason);
    const payload = {
      room: roomState.room,
      who: this._selfKey(),
      reason,
      at,
      stats,
    };
    this._emit('session_expired', payload, { at, source: 'local' });
    this._broadcast(roomState.room, 'session_expired', payload, at);
    return { ok: true, room: this._serializeRoom(roomState), stats };
  }

  startSession({ room, minutes = 25, goal = '' }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    if (roomState.status === 'active') return { ok: false, error: 'room is already active' };
    const startedAt = this._now();
    const durationMin = Number.isFinite(minutes) ? Math.max(1, minutes) : 25;
    const endsAt = startedAt + durationMin * 60_000;
    const host = this._selfKey();
    this._applySessionStart(
      roomState,
      {
        room: roomState.room,
        host,
        goal: String(goal || '').slice(0, 240),
        startedAt,
        endsAt,
      },
      startedAt
    );
    const payload = {
      room: roomState.room,
      host,
      goal: roomState.goal,
      startedAt,
      endsAt,
    };
    this._emit('session_start', payload, { at: startedAt, source: 'local' });
    this._broadcast(roomState.room, 'session_start', payload, startedAt);
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  extendSession({ room, minutes = 5 }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    if (roomState.status !== 'active') return { ok: false, error: 'room is not active' };
    if (roomState.host !== this._selfKey()) return { ok: false, error: 'only host can extend session' };
    const addMin = Number.isFinite(minutes) ? Math.max(1, minutes) : 5;
    const now = this._now();
    const baseline = Number.isFinite(roomState.endsAt) ? Math.max(roomState.endsAt, now) : now;
    roomState.endsAt = baseline + addMin * 60_000;
    roomState.lastEventAt = now;
    this._scheduleExpiry(roomState);
    const payload = {
      room: roomState.room,
      who: this._selfKey(),
      minutes: addMin,
      endsAt: roomState.endsAt,
      at: now,
    };
    this._emit('session_extend', payload, { at: now, source: 'local' });
    this._broadcast(roomState.room, 'session_extend', payload, now);
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  joinSession({ room }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    const who = this._selfKey();
    const at = this._now();
    roomState.participants.add(who);
    roomState.lastEventAt = at;
    const payload = { room: roomState.room, who, at };
    this._emit('session_join', payload, { at, source: 'local' });
    this._broadcast(roomState.room, 'session_join', payload, at);
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  checkIn({ room, status }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    const note = String(status || '').trim();
    if (!note) return { ok: false, error: 'status is required' };
    const at = this._now();
    const who = this._selfKey();
    roomState.participants.add(who);
    roomState.lastEventAt = at;
    roomState.checkins.push({ who, at, status: note.slice(0, 240) });
    if (roomState.checkins.length > 50) roomState.checkins.shift();
    const payload = { room: roomState.room, who, status: note.slice(0, 240), at };
    this._emit('session_checkin', payload, { at, source: 'local' });
    this._broadcast(roomState.room, 'session_checkin', payload, at);
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  endSession({ room, summary = '' }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    if (roomState.status !== 'active') return { ok: false, error: 'room is not active' };
    if (roomState.host !== this._selfKey()) return { ok: false, error: 'only host can end session' };
    const at = this._now();
    const stats = this._computeStats(roomState, at);
    this._applySessionEnd(roomState, { stats }, at, 'manual');
    const payload = {
      room: roomState.room,
      who: this._selfKey(),
      summary: String(summary || '').slice(0, 240),
      at,
      stats,
    };
    this._emit('session_end', payload, { at, source: 'local' });
    this._broadcast(roomState.room, 'session_end', payload, at);
    return { ok: true, room: this._serializeRoom(roomState), stats };
  }

  listRooms() {
    return Array.from(this.rooms.values()).map((room) => this._serializeRoom(room));
  }

  listStreaks() {
    return Array.from(this.streaks.entries())
      .map(([peer, sessions]) => ({ peer, sessions }))
      .sort((a, b) => b.sessions - a.sessions);
  }

  getRoom(room) {
    const roomState = this.rooms.get(String(room || '').trim());
    return roomState ? this._serializeRoom(roomState) : null;
  }

  _serializeRoom(roomState) {
    return {
      room: roomState.room,
      host: roomState.host,
      goal: roomState.goal,
      startedAt: roomState.startedAt,
      endsAt: roomState.endsAt,
      lastEventAt: roomState.lastEventAt,
      status: roomState.status,
      endedAt: roomState.endedAt,
      endedReason: roomState.endedReason,
      participants: Array.from(roomState.participants.values()),
      checkins: roomState.checkins.slice(-10),
      stats: roomState.stats,
    };
  }

  handleIncoming(channel, payload) {
    const message = payload?.message;
    if (!message || message.app !== 'focus_room') return false;
    const eventType = String(message.eventType || '').trim();
    const data = message.payload || {};
    const roomName = String(data.room || channel || '').trim();
    const roomState = this._upsertRoom(roomName);
    if (!roomState) return false;
    const actor = String(message.by || payload?.from || 'unknown').toLowerCase();
    const at = Number.isFinite(message.at) ? message.at : this._now();

    if (Number.isFinite(roomState.lastEventAt) && at < roomState.lastEventAt) {
      // Ignore stale/out-of-order events to avoid replay-driven state rollback.
      return false;
    }

    if (eventType === 'session_start') {
      const host = String(data.host || actor).toLowerCase();
      if (!host || host === 'unknown') return false;
      if (roomState.status === 'active' && roomState.host && roomState.host !== host) {
        return false;
      }
      this._applySessionStart(roomState, { ...data, host }, at);
    } else if (eventType === 'session_join') {
      roomState.participants.add(String(data.who || actor).toLowerCase());
      roomState.lastEventAt = at;
    } else if (eventType === 'session_checkin') {
      const note = String(data.status || '').trim().slice(0, 240);
      if (!note) return false;
      const who = String(data.who || actor).toLowerCase();
      if (!who || who === 'unknown') return false;
      roomState.participants.add(who);
      roomState.checkins.push({
        who,
        at: Number.isFinite(data.at) ? data.at : at,
        status: note,
      });
      if (roomState.checkins.length > 50) roomState.checkins.shift();
      roomState.lastEventAt = at;
    } else if (eventType === 'session_extend') {
      const who = String(data.who || actor).toLowerCase();
      if (roomState.host && who !== roomState.host) return false;
      if (!Number.isFinite(data.endsAt)) return false;
      roomState.endsAt = data.endsAt;
      roomState.lastEventAt = at;
      this._scheduleExpiry(roomState);
    } else if (eventType === 'session_expired') {
      const who = String(data.who || actor).toLowerCase();
      if (roomState.host && who !== roomState.host) return false;
      this._applySessionEnd(roomState, data, at, 'timer');
    } else if (eventType === 'session_end') {
      const who = String(data.who || actor).toLowerCase();
      if (roomState.host && who !== roomState.host) return false;
      this._applySessionEnd(roomState, data, at, 'manual');
    } else {
      return false;
    }

    this._emit(eventType, data, { at, by: actor, source: 'remote' });
    return true;
  }
}

export default FocusRoom;
