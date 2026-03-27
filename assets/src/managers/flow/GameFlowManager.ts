export type GamePhase =
    | 'boot'
    | 'idle'
    | 'selecting_hand'
    | 'preplace_track'
    | 'preplace_locked'
    | 'resolving_place'
    | 'animating_refill'
    | 'settlement';

/**
 * 游戏进程管理器：
 * 统一描述当前局内流程阶段，便于后续拆开 MainGame 中的状态控制。
 */
export class GameFlowManager {
    private phase: GamePhase = 'boot';

    public getPhase(): GamePhase {
        return this.phase;
    }

    public setPhase(phase: GamePhase): void {
        this.phase = phase;
    }

    public isInteractive(): boolean {
        return this.phase !== 'resolving_place' && this.phase !== 'animating_refill';
    }
}
