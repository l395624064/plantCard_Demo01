export type type_tmptrace_phase = 'enter' | 'state' | 'exit' | 'error';

export type type_tmptrace_status = 'ok' | 'fail';

export type type_tmptrace_runtime = 'web' | 'native' | 'unknown';

export type type_tmptrace_actor = 'user' | 'ai' | 'system';

export type type_tmptrace_event_kind = 'action' | 'state' | 'decision' | 'assert' | 'system';

export type type_tmptrace_payload_value =
  | string
  | number
  | boolean
  | null
  | interface_tmptrace_payload_map
  | type_tmptrace_payload_value[];

export interface interface_tmptrace_payload_map {
  readonly [key: string]: type_tmptrace_payload_value;
}

export interface interface_tmptrace_record {
  readonly traceVersion: 'v1';
  readonly runtime: type_tmptrace_runtime;
  readonly sessionId: string;
  readonly feature: string;
  readonly unitId: string;
  readonly stepId: string;
  readonly seq: number;
  readonly prevSeq: number | null;
  readonly phase: type_tmptrace_phase;
  readonly eventKind: type_tmptrace_event_kind;
  readonly actor: type_tmptrace_actor;
  readonly source: string;
  readonly action: string;
  readonly effect: string;
  readonly expected?: string;
  readonly observed?: string;
  readonly decision?: string;
  readonly reason?: string;
  readonly status: type_tmptrace_status;
  readonly ts: number;
  readonly tags?: string[];
  readonly payload?: interface_tmptrace_payload_map;
}

export interface interface_tmptrace_log_input {
  readonly unitId: string;
  readonly stepId?: string;
  readonly phase: type_tmptrace_phase;
  readonly eventKind?: type_tmptrace_event_kind;
  readonly actor?: type_tmptrace_actor;
  readonly source?: string;
  readonly action: string;
  readonly effect: string;
  readonly expected?: string;
  readonly observed?: string;
  readonly decision?: string;
  readonly reason?: string;
  readonly status: type_tmptrace_status;
  readonly tags?: string[];
  readonly payload?: interface_tmptrace_payload_map;
}

export interface interface_tmptrace_update_patch {
  readonly stepId?: string;
  readonly phase?: type_tmptrace_phase;
  readonly eventKind?: type_tmptrace_event_kind;
  readonly actor?: type_tmptrace_actor;
  readonly source?: string;
  readonly action?: string;
  readonly effect?: string;
  readonly expected?: string;
  readonly observed?: string;
  readonly decision?: string;
  readonly reason?: string;
  readonly status?: type_tmptrace_status;
  readonly tags?: string[];
  readonly payload?: interface_tmptrace_payload_map;
}

export interface interface_tmptrace_session {
  readonly sessionId: string;
  readonly feature: string;
  readonly createdAt: number;
  updatedAt: number;
  records: interface_tmptrace_record[];
}

export interface interface_tmptrace_archive {
  readonly session: interface_tmptrace_session;
  readonly exportedAt: number;
  readonly totalRecords: number;
}
