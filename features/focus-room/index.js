class FocusRoom {
  constructor(peer, options = {}) {
    this.peer = peer;
    this.entryChannel = options.entryChannel || '0000intercom';
    this.rooms = new Map();
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
        participants: new Set(),
        checkins: [],
      });
    }
    return this.rooms.get(key);
  }

  _toMessage(eventType, payload = {}) {
    return {
      app: 'focus_room',
      eventType,
      payload,
      at: this._now(),
      by: this._selfKey(),
    };
  }

  _broadcast(channel, eventType, payload = {}) {
    if (!this.peer?.sidechannel) return false;
    return this.peer.sidechannel.broadcast(channel || this.entryChannel, this._toMessage(eventType, payload));
  }

  startSession({ room, minutes = 25, goal = '' }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    const startedAt = this._now();
    const durationMin = Number.isFinite(minutes) ? Math.max(1, minutes) : 25;
    const endsAt = startedAt + durationMin * 60_000;
    const host = this._selfKey();
    roomState.host = host;
    roomState.goal = String(goal || '').slice(0, 240);
    roomState.startedAt = startedAt;
    roomState.endsAt = endsAt;
    roomState.lastEventAt = startedAt;
    roomState.status = 'active';
    roomState.participants.add(host);
    this._broadcast(roomState.room, 'session_start', {
      room: roomState.room,
      host,
      goal: roomState.goal,
      startedAt,
      endsAt,
    });
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  joinSession({ room }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    const who = this._selfKey();
    roomState.participants.add(who);
    roomState.lastEventAt = this._now();
    this._broadcast(roomState.room, 'session_join', {
      room: roomState.room,
      who,
    });
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
    this._broadcast(roomState.room, 'session_checkin', {
      room: roomState.room,
      who,
      status: note.slice(0, 240),
      at,
    });
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  endSession({ room, summary = '' }) {
    const roomState = this._upsertRoom(room);
    if (!roomState) return { ok: false, error: 'room is required' };
    const at = this._now();
    roomState.status = 'ended';
    roomState.lastEventAt = at;
    this._broadcast(roomState.room, 'session_end', {
      room: roomState.room,
      who: this._selfKey(),
      summary: String(summary || '').slice(0, 240),
      at,
    });
    return { ok: true, room: this._serializeRoom(roomState) };
  }

  listRooms() {
    return Array.from(this.rooms.values()).map((room) => this._serializeRoom(room));
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
      participants: Array.from(roomState.participants.values()),
      checkins: roomState.checkins.slice(-10),
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
    roomState.lastEventAt = at;
    if (eventType === 'session_start') {
      roomState.host = String(data.host || actor || roomState.host || '').toLowerCase();
      roomState.goal = String(data.goal || '').slice(0, 240);
      roomState.startedAt = Number.isFinite(data.startedAt) ? data.startedAt : at;
      roomState.endsAt = Number.isFinite(data.endsAt) ? data.endsAt : null;
      roomState.status = 'active';
      if (roomState.host) roomState.participants.add(roomState.host);
    } else if (eventType === 'session_join') {
      roomState.participants.add(String(data.who || actor).toLowerCase());
    } else if (eventType === 'session_checkin') {
      const note = String(data.status || '').slice(0, 240);
      const who = String(data.who || actor).toLowerCase();
      roomState.participants.add(who);
      roomState.checkins.push({
        who,
        at: Number.isFinite(data.at) ? data.at : at,
        status: note,
      });
      if (roomState.checkins.length > 50) roomState.checkins.shift();
    } else if (eventType === 'session_end') {
      roomState.status = 'ended';
    }
    return true;
  }
}

export default FocusRoom;
