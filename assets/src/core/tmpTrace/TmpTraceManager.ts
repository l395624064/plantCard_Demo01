import {
  type_tmptrace_event_kind,
  type_tmptrace_runtime,
  interface_tmptrace_archive,
  interface_tmptrace_log_input,
  interface_tmptrace_payload_map,
  interface_tmptrace_record,
  interface_tmptrace_session,
  interface_tmptrace_update_patch,
} from './TmpTraceEnum';

class TmpTraceManager {
  private readonly maxArchiveItems = 20;
  private readonly maxRuntimeRecords = 500;
  private readonly archiveStorageKey = 'tmp_trace_archive_v1';
  private readonly runtimeStorageKey = 'tmp_trace_runtime_v1';
  private sessions = new Map<string, interface_tmptrace_session>();
  private currentSessionId = '';
  private seqSeed = 0;
  private lastSeqBySession = new Map<string, number>();

  public setEnabled(enabled: boolean): void {
    // Compatibility no-op: tmp trace is always enabled by design.
    if (!enabled) {
      console.warn('[TMP_TRACE] setEnabled(false) ignored; tracing is always enabled.');
    }
  }

  public isEnabled(): boolean {
    return true;
  }

  public setConsoleEchoEnabled(enabled: boolean): void {
    // Compatibility no-op: console echo is always enabled by design.
    if (!enabled) {
      console.warn('[TMP_TRACE] setConsoleEchoEnabled(false) ignored; console echo is always enabled.');
    }
  }

  public isConsoleEchoEnabled(): boolean {
    return true;
  }

  public startSession(feature: string, payload?: interface_tmptrace_payload_map): string {
    const sessionId = this.createSessionId(feature);
    const now = Date.now();
    const session: interface_tmptrace_session = {
      sessionId,
      feature,
      createdAt: now,
      updatedAt: now,
      records: [],
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;
    this.lastSeqBySession.set(sessionId, 0);
    this.log({
      unitId: '__session__',
      stepId: '__session__:start',
      phase: 'enter',
      eventKind: 'system',
      actor: 'system',
      source: 'TmpTraceManager.startSession',
      action: 'start_session',
      effect: 'trace_session_ready',
      status: 'ok',
      payload,
    });
    return sessionId;
  }

  public log(input: interface_tmptrace_log_input, sessionId?: string): interface_tmptrace_record | null {
    const target = this.getMutableSession(sessionId);
    if (!target) {
      return null;
    }

    const runtime = this.detectRuntime();
    const seq = this.nextSeq();
    const prevSeq = this.lastSeqBySession.get(target.sessionId) ?? null;
    this.lastSeqBySession.set(target.sessionId, seq);

    const record: interface_tmptrace_record = {
      traceVersion: 'v1',
      runtime,
      sessionId: target.sessionId,
      feature: target.feature,
      unitId: input.unitId,
      stepId: input.stepId ?? `${input.unitId}:${input.phase}`,
      seq,
      prevSeq,
      phase: input.phase,
      eventKind: input.eventKind ?? this.deriveEventKind(input.phase),
      actor: input.actor ?? 'system',
      source: input.source ?? 'unknown',
      action: input.action,
      effect: input.effect,
      expected: input.expected,
      observed: input.observed,
      decision: input.decision,
      reason: input.reason,
      status: input.status,
      ts: Date.now(),
      tags: input.tags,
      payload: input.payload,
    };

    target.records.push(record);
    target.updatedAt = record.ts;
    this.persistRuntimeRecord(record);
    this.echoRecord(record);
    return record;
  }

  public updateRecord(sessionId: string, seq: number, patch: interface_tmptrace_update_patch): boolean {
    const target = this.sessions.get(sessionId);
    if (!target) {
      return false;
    }
    const index = target.records.findIndex((entry) => entry.seq === seq);
    if (index < 0) {
      return false;
    }

    const prev = target.records[index];
    const next: interface_tmptrace_record = {
      traceVersion: prev.traceVersion,
      runtime: prev.runtime,
      sessionId: prev.sessionId,
      feature: prev.feature,
      unitId: prev.unitId,
      stepId: patch.stepId ?? prev.stepId,
      seq: prev.seq,
      prevSeq: prev.prevSeq,
      phase: patch.phase ?? prev.phase,
      eventKind: patch.eventKind ?? prev.eventKind,
      actor: patch.actor ?? prev.actor,
      source: patch.source ?? prev.source,
      action: patch.action ?? prev.action,
      effect: patch.effect ?? prev.effect,
      expected: patch.expected ?? prev.expected,
      observed: patch.observed ?? prev.observed,
      decision: patch.decision ?? prev.decision,
      reason: patch.reason ?? prev.reason,
      status: patch.status ?? prev.status,
      ts: Date.now(),
      tags: patch.tags ?? prev.tags,
      payload: patch.payload ?? prev.payload,
    };
    target.records[index] = next;
    target.updatedAt = next.ts;
    return true;
  }

  public deleteRecord(sessionId: string, seq: number): boolean {
    const target = this.sessions.get(sessionId);
    if (!target) {
      return false;
    }

    const beforeLength = target.records.length;
    target.records = target.records.filter((entry) => entry.seq !== seq);
    if (target.records.length === beforeLength) {
      return false;
    }
    target.updatedAt = Date.now();
    return true;
  }

  public archiveSession(sessionId?: string): interface_tmptrace_archive | null {
    const target = this.getMutableSession(sessionId);
    if (!target) {
      return null;
    }
    const archive: interface_tmptrace_archive = {
      session: this.cloneSession(target),
      exportedAt: Date.now(),
      totalRecords: target.records.length,
    };
    this.persistArchive(archive);
    return archive;
  }

  public clearSession(sessionId: string): boolean {
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = '';
    }
    this.lastSeqBySession.delete(sessionId);
    return this.sessions.delete(sessionId);
  }

  public getSession(sessionId?: string): interface_tmptrace_session | null {
    const target = this.getMutableSession(sessionId);
    if (!target) {
      return null;
    }
    return this.cloneSession(target);
  }

  public getRecentRecords(limit = 20, sessionId?: string): interface_tmptrace_record[] {
    const target = this.getMutableSession(sessionId);
    if (!target) {
      return [];
    }
    const safeLimit = limit > 0 ? limit : 1;
    const start = Math.max(0, target.records.length - safeLimit);
    return target.records.slice(start).map((entry) => ({ ...entry }));
  }

  public getCurrentSessionId(): string {
    return this.currentSessionId;
  }

  public enableGuidedAssistTrace(): void {
    this.setEnabled(true);
    this.setConsoleEchoEnabled(true);
  }

  public disableGuidedAssistTrace(): void {
    // Compatibility no-op: guided trace cannot be disabled.
  }

  private getMutableSession(sessionId?: string): interface_tmptrace_session | null {
    const id = sessionId ?? this.currentSessionId;
    if (!id) {
      return null;
    }
    return this.sessions.get(id) ?? null;
  }

  private cloneSession(session: interface_tmptrace_session): interface_tmptrace_session {
    return {
      ...session,
      records: session.records.map((entry) => ({ ...entry })),
    };
  }

  private nextSeq(): number {
    this.seqSeed += 1;
    return this.seqSeed;
  }

  private deriveEventKind(phase: interface_tmptrace_log_input['phase']): type_tmptrace_event_kind {
    if (phase === 'enter') {
      return 'action';
    }
    if (phase === 'state') {
      return 'state';
    }
    if (phase === 'exit') {
      return 'assert';
    }
    return 'assert';
  }

  private detectRuntime(): type_tmptrace_runtime {
    if (typeof window !== 'undefined') {
      return 'web';
    }
    return 'unknown';
  }

  private echoRecord(record: interface_tmptrace_record): void {
    if (typeof console === 'undefined') {
      return;
    }
    console.log('[TMP_TRACE]', record);
  }

  private createSessionId(feature: string): string {
    const safeFeature = feature.trim() === '' ? 'feature' : feature.trim();
    const rand = Math.random().toString(36).slice(2, 8);
    return `${safeFeature}_${Date.now()}_${rand}`;
  }

  private persistArchive(archive: interface_tmptrace_archive): void {
    const storage = this.getLocalStorage();
    if (!storage) {
      return;
    }

    const list = this.readArchiveList(storage);
    list.unshift(archive);
    if (list.length > this.maxArchiveItems) {
      list.length = this.maxArchiveItems;
    }
    storage.setItem(this.archiveStorageKey, JSON.stringify(list));
  }

  private readArchiveList(storage: Storage): interface_tmptrace_archive[] {
    const raw = storage.getItem(this.archiveStorageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as interface_tmptrace_archive[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistRuntimeRecord(record: interface_tmptrace_record): void {
    const storage = this.getLocalStorage();
    if (!storage) {
      return;
    }
    const list = this.readRuntimeRecords(storage);
    list.push(record);
    if (list.length > this.maxRuntimeRecords) {
      list.splice(0, list.length - this.maxRuntimeRecords);
    }
    storage.setItem(this.runtimeStorageKey, JSON.stringify(list));
  }

  private readRuntimeRecords(storage: Storage): interface_tmptrace_record[] {
    const raw = storage.getItem(this.runtimeStorageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as interface_tmptrace_record[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private getLocalStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.localStorage ?? null;
    } catch {
      return null;
    }
  }

}

export const tmpTraceManager = new TmpTraceManager();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).tmpTraceManager = tmpTraceManager;
}
