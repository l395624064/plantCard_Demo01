import { Tween, Vec3, tween } from 'cc';
import {
    fn_game_apply_hand_fan_layout_for_view,
    fn_game_get_fan_slot_transform_for_view,
    fn_game_pick_distinct_start,
} from './HandRenderController';
import { fn_game_view_ensure_hand_view_count_for_view } from './GameViewSceneAssembler';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}

export function fn_game_start_hand_refill_animation_for_view(
    view: any,
    removedIdx: number,
    snap: { positions: Vec3[]; eulers: Vec3[] },
    oldIds: (string | null)[],
    handSlots: any[],
): void {
    if (!view.handPanel) {
        return;
    }
    fn_game_view_ensure_hand_view_count_for_view(view, handSlots.length);

    for (const v of view.handViews) {
        Tween.stopAllByTarget(v.node);
    }

    view.handRefillAnimRunning = true;
    view.hoverHandIndex = null;

    const durationSlide = 0.38;
    const durationFly = 0.52;
    const usedStarts: Vec3[] = [];

    let remaining = 0;
    const onOneDone = (): void => {
        remaining--;
        if (remaining <= 0) {
            view.handRefillAnimRunning = false;
            for (const v of view.handViews) {
                v.node.setScale(1, 1, 1);
            }
            fn_game_apply_hand_fan_layout_for_view(view);
        }
    };

    for (let i = 0; i < handSlots.length; i++) {
        const node = view.handViews[i].node;
        const slot = handSlots[i];
        const target = fn_game_get_fan_slot_transform_for_view(view, i, handSlots.length);
        const targetPos = new Vec3(target.x, target.y, 0);
        const targetEuler = new Vec3(0, 0, target.zDeg);
        node.setScale(1, 1, 1);
        node.active = true;

        const card = slot?.card ?? null;

        if (!card) {
            const base = snap.positions[i] ?? targetPos;
            const startPos = fn_game_pick_distinct_start(base, usedStarts);
            node.setPosition(startPos);
            node.setRotationFromEuler(snap.eulers[i].x, snap.eulers[i].y, snap.eulers[i].z);
            remaining++;
            tween(node)
                .to(durationSlide, { position: targetPos, eulerAngles: targetEuler }, { easing: 'quadOut' })
                .call(onOneDone)
                .start();
            continue;
        }

        let oldJ = oldIds.findIndex((id) => id !== null && id === card.id);
        if (oldJ === removedIdx) {
            oldJ = -1;
        }

        if (oldJ >= 0) {
            const base = snap.positions[oldJ].clone();
            const startPos = fn_game_pick_distinct_start(base, usedStarts);
            const startEuler = snap.eulers[oldJ].clone();
            node.setPosition(startPos);
            node.setRotationFromEuler(startEuler.x, startEuler.y, startEuler.z);
            remaining++;
            tween(node)
                .to(durationSlide, { position: targetPos, eulerAngles: targetEuler }, { easing: 'quadOut' })
                .call(onOneDone)
                .start();
            continue;
        }

        const rightX = view.rootWidth / 2 - view.handCardWidth * 0.22;
        const midX = (rightX + target.x) * 0.55;
        const midY = Math.max(target.y, -view.handPanelHeight * 0.1) + clamp(view.handCardHeight * 0.55, 70, 110);
        const p0 = new Vec3(rightX, target.y + 40, 0);
        const p1 = new Vec3(midX, midY, 0);
        const p2 = targetPos.clone();
        const startZ = target.zDeg * 0.35;
        node.setPosition(p0);
        node.setRotationFromEuler(0, 0, startZ);

        remaining++;
        const proxy = { t: 0 };
        tween(proxy)
            .to(
                durationFly,
                { t: 1 },
                {
                    easing: 'quadOut',
                    onUpdate: (value: { t: number }) => {
                        const t = clamp(value.t, 0, 1);
                        const omt = 1 - t;
                        const x = omt * omt * p0.x + 2 * omt * t * p1.x + t * t * p2.x;
                        const y = omt * omt * p0.y + 2 * omt * t * p1.y + t * t * p2.y;
                        node.setPosition(x, y, 0);
                        const ez = lerp(startZ, targetEuler.z, t);
                        node.setRotationFromEuler(0, 0, ez);
                    },
                },
            )
            .call(onOneDone)
            .start();
    }

    if (remaining === 0) {
        view.handRefillAnimRunning = false;
    }
    for (let i = handSlots.length; i < view.handViews.length; i++) {
        view.handViews[i].node.active = false;
    }
}
