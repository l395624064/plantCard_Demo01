import { PlacementPreview } from '../../GameTypes';

export interface ScoreBreakdown {
    total: number;
    sameColorHits: number;
    diffColorHits: number;
    requiredRotten: number;
}

/**
 * 分数结算管理器：
 * 负责把出牌结果整理成 UI 可展示的结算结构。
 * 现阶段不替代 GameModel，只负责结算摘要与表现层适配。
 */
export class ScoreManager {
    public buildBreakdown(preview: PlacementPreview): ScoreBreakdown {
        return {
            total: preview.scoreGain,
            sameColorHits: preview.sameColorHits.length,
            diffColorHits: preview.diffColorHits.length,
            requiredRotten: preview.requiredRotten,
        };
    }

    public buildSummary(preview: PlacementPreview): string {
        if (!preview.isValid) {
            return preview.reason;
        }
        return [
            `得分 +${preview.scoreGain}`,
            `同色重叠 ${preview.sameColorHits.length}`,
            `异色重叠 ${preview.diffColorHits.length}`,
        ].join(' | ');
    }
}
