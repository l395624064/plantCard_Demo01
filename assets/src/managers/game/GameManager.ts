import { Node } from 'cc';
import { GameModel } from '../../GameModel';
import { GameViewCallbacks, GameViewState } from '../../GameView';
import { BuffSkillManager } from '../buff/BuffSkillManager';
import { CardManager } from '../card/CardManager';
import { EffectManager } from '../effect/EffectManager';
import { GameFlowManager } from '../flow/GameFlowManager';
import { ScoreManager } from '../score/ScoreManager';
import { UIManager } from '../ui/UIManager';

/**
 * 游戏管理器：
 * 汇总各个子管理器，作为未来 MainGame 的唯一高层入口。
 * 当前为过渡骨架，避免一次性重构过大。
 */
export class GameManager {
    public readonly model: GameModel;
    public readonly card: CardManager;
    public readonly ui: UIManager;
    public readonly effect: EffectManager;
    public readonly buffSkill: BuffSkillManager;
    public readonly score: ScoreManager;
    public readonly flow: GameFlowManager;

    constructor() {
        this.model = new GameModel();
        this.card = new CardManager(this.model);
        this.ui = new UIManager();
        this.effect = new EffectManager();
        this.buffSkill = new BuffSkillManager();
        this.score = new ScoreManager();
        this.flow = new GameFlowManager();
    }

    public buildUI(root: Node, callbacks: GameViewCallbacks): void {
        this.ui.build(root, callbacks);
    }

    public render(state: GameViewState): void {
        this.ui.render(state);
    }

    public destroy(): void {
        this.ui.destroy();
    }
}
