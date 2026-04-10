import { GridPos } from '../core/types/BaseGameTypes';

export function cloneGridPos(pos: GridPos | null): GridPos | null {
    if (!pos) {
        return null;
    }
    return { x: pos.x, y: pos.y };
}
