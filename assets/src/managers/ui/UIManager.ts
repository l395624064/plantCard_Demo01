import { Node } from 'cc';
import { GameView, HandLayoutSnapshot } from '../../GameView';
import { GameViewCallbacks, GameViewState } from '../../GameView';

/**
 * UI 管理器：
 * 负责 GameView 的创建、销毁、刷新和界面动画调度入口。
 */
export class UIManager {
    private view: GameView | null = null;

    public build(root: Node, callbacks: GameViewCallbacks): GameView {
        if (this.view) {
            this.view.destroyView();
        }
        this.view = new GameView(root, callbacks);
        return this.view;
    }

    public getView(): GameView | null {
        return this.view;
    }

    public destroy(): void {
        this.view?.destroyView();
        this.view = null;
    }

    public render(state: GameViewState): void {
        this.view?.render(state);
    }

    public captureHandLayoutSnapshot(): HandLayoutSnapshot | null {
        return this.view?.captureHandLayoutSnapshot() ?? null;
    }

    public scheduleHandRefillAnimation(removedIdx: number, snap: HandLayoutSnapshot, oldIds: (string | null)[]): void {
        this.view?.scheduleHandRefillAnimation(removedIdx, snap, oldIds);
    }
}
