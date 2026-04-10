import { Graphics, Tween, tween } from 'cc';

export function fn_game_rotate_point_around_pivot(
    x: number,
    y: number,
    pivotX: number,
    pivotY: number,
    angleRad: number,
): { x: number; y: number } {
    if (Math.abs(angleRad) < 0.0001) {
        return { x, y };
    }
    const dx = x - pivotX;
    const dy = y - pivotY;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
        x: pivotX + dx * cos - dy * sin,
        y: pivotY + dx * sin + dy * cos,
    };
}

export function fn_game_trace_preview_rect(
    graphics: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    pivotX: number,
    pivotY: number,
    angleRad: number,
): void {
    if (Math.abs(angleRad) < 0.0001) {
        graphics.rect(x, y, width, height);
        return;
    }
    const corners = [
        fn_game_rotate_point_around_pivot(x, y, pivotX, pivotY, angleRad),
        fn_game_rotate_point_around_pivot(x + width, y, pivotX, pivotY, angleRad),
        fn_game_rotate_point_around_pivot(x + width, y + height, pivotX, pivotY, angleRad),
        fn_game_rotate_point_around_pivot(x, y + height, pivotX, pivotY, angleRad),
    ];
    graphics.moveTo(corners[0].x, corners[0].y);
    graphics.lineTo(corners[1].x, corners[1].y);
    graphics.lineTo(corners[2].x, corners[2].y);
    graphics.lineTo(corners[3].x, corners[3].y);
    graphics.lineTo(corners[0].x, corners[0].y);
}

export function fn_game_sync_preview_rotate_tween_for_view(view: any, state: any): void {
    const preview = state.preview;
    if (!preview) {
        Tween.stopAllByTarget(view.previewRotateTweenState);
        view.previewRotateTweenState.extraDeg = 0;
        view.previewRotateTweenState.offsetX = 0;
        view.previewRotateTweenState.offsetY = 0;
        view.previewRotateAnchorKey = '';
        view.previewRotateLogical = 0;
        return;
    }

    const anchorKey = `${preview.anchor.x},${preview.anchor.y}:${state.preplaceLocked ? 'locked' : 'free'}`;
    if (!state.preplaceLocked) {
        Tween.stopAllByTarget(view.previewRotateTweenState);
        view.previewRotateTweenState.extraDeg = 0;
        view.previewRotateTweenState.offsetX = 0;
        view.previewRotateTweenState.offsetY = 0;
        view.previewRotateAnchorKey = anchorKey;
        view.previewRotateLogical = state.rotation;
        return;
    }

    if (view.previewRotateAnchorKey !== anchorKey) {
        Tween.stopAllByTarget(view.previewRotateTweenState);
        view.previewRotateTweenState.extraDeg = 0;
        view.previewRotateTweenState.offsetX = 0;
        view.previewRotateTweenState.offsetY = 0;
        view.previewRotateAnchorKey = anchorKey;
        view.previewRotateLogical = state.rotation;
        return;
    }

    if (view.previewRotateLogical !== state.rotation) {
        const prevPreview = view.lastRenderState?.preview ?? null;
        view.previewRotateLogical = state.rotation;
        Tween.stopAllByTarget(view.previewRotateTweenState);
        view.previewRotateTweenState.extraDeg = state.rotationStep > 0
            ? 90
            : state.rotationStep < 0
                ? -90
                : 0;
        if (prevPreview) {
            const prevCenter = view.previewCellsToBoardCenter(prevPreview.cells);
            const nextCenter = view.previewCellsToBoardCenter(preview.cells);
            view.previewRotateTweenState.offsetX = prevCenter.x - nextCenter.x;
            view.previewRotateTweenState.offsetY = prevCenter.y - nextCenter.y;
        } else {
            view.previewRotateTweenState.offsetX = 0;
            view.previewRotateTweenState.offsetY = 0;
        }
        tween(view.previewRotateTweenState)
            .to(0.18, { extraDeg: 0, offsetX: 0, offsetY: 0 }, { easing: 'quadOut' })
            .start();
    }
}
