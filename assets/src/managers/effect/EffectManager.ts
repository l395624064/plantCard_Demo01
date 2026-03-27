import { Node, Tween, tween, Vec3 } from 'cc';

/**
 * 特效管理器：
 * 统一承接轻量 UI / 棋盘表现层动画。
 * 当前只提供通用 tween 工具，后续可沉淀补牌、旋转、提示线等效果。
 */
export class EffectManager {
    public stop(target: object): void {
        Tween.stopAllByTarget(target);
    }

    public pulse(node: Node, scale = 1.05, duration = 0.12): void {
        Tween.stopAllByTarget(node);
        tween(node)
            .to(duration, { scale: new Vec3(scale, scale, 1) }, { easing: 'quadOut' })
            .to(duration, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
            .start();
    }

    public moveTo(node: Node, position: Vec3, duration = 0.2): void {
        Tween.stopAllByTarget(node);
        tween(node)
            .to(duration, { position }, { easing: 'quadOut' })
            .start();
    }
}
