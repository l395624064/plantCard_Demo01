import { GridPos } from '../../types/BaseGameTypes';
import { interface_tmptrace_log_input } from '../TmpTraceEnum';
import { tmpTraceManager } from '../TmpTraceManager';

interface interface_tmptrace_gameview_drag_payload {
  readonly preplacePhase: 'idle' | 'preplace1_track' | 'preplace2';
  readonly preplaceHandIndex: number | null;
  readonly handDragLiftY: number;
}

function writeTrace(input: interface_tmptrace_log_input): void {
  if (!tmpTraceManager.isEnabled()) {
    return;
  }
  tmpTraceManager.log(input);
}

export function fn_tmp_trace_game_view_impl_emit_state1_drag(
  source: string,
  payload: interface_tmptrace_gameview_drag_payload,
): void {
  writeTrace({
    unitId: 'GameViewImpl_U01',
    stepId: 'GameViewImpl_U01_beginDrag',
    phase: 'enter',
    actor: 'user',
    source,
    action: 'start_hand_drag',
    effect: 'enter_preplace1_track',
    expected: 'drag tracking begins from hand area',
    observed: `liftY=${payload.handDragLiftY.toFixed(2)}`,
    status: 'ok',
    payload: {
      preplacePhase: payload.preplacePhase,
      handIndex: payload.preplaceHandIndex,
      liftY: payload.handDragLiftY,
    },
    tags: ['preplace', 'state1', 'drag'],
  });
}

export function fn_tmp_trace_game_view_impl_on_enter_preplace2(
  anchor: GridPos,
): void {
  writeTrace({
    unitId: 'GameViewImpl_U02',
    stepId: 'GameViewImpl_U02_enterPreplace2',
    phase: 'state',
    actor: 'system',
    source: 'GameViewImpl.enterPreplace2',
    action: 'enter_preplace2',
    effect: 'preview_locked_to_anchor',
    expected: 'card preview enters preplace state2',
    observed: `anchor(${anchor.x},${anchor.y})`,
    status: 'ok',
    payload: {
      x: anchor.x,
      y: anchor.y,
    },
    tags: ['preplace', 'state2', 'anchor'],
  });
}

export function fn_tmp_trace_game_view_impl_on_preplace2_exit(
  observedMessage: string,
  preplacePhase: 'idle' | 'preplace1_track' | 'preplace2',
  preplaceLocked: boolean,
): void {
  writeTrace({
    unitId: 'GameViewImpl_U03',
    stepId: 'GameViewImpl_U03_preplace2Exit',
    phase: 'exit',
    actor: 'system',
    source: 'GameViewImpl.render',
    action: 'preplace2_unlock_detected',
    effect: 'exit_preplace_flow',
    expected: 'preplace2 completes and returns to idle flow',
    observed: observedMessage,
    status: 'ok',
    payload: {
      preplacePhase,
      preplaceLocked,
    },
    tags: ['preplace', 'state2', 'complete'],
  });
}
