export interface RuntimeModifier {
    id: string;
    label: string;
    type: 'buff' | 'debuff' | 'skill';
    description: string;
    stacks?: number;
    durationRounds?: number;
}

/**
 * Buff / Skill 管理器：
 * 负责角色与局内临时效果、被动技能、主动技能状态缓存。
 * 目前为占位骨架，后续接入右上角状态展示区。
 */
export class BuffSkillManager {
    private readonly modifiers: RuntimeModifier[] = [];

    public list(): RuntimeModifier[] {
        return this.modifiers.slice();
    }

    public add(modifier: RuntimeModifier): void {
        this.modifiers.push(modifier);
    }

    public remove(id: string): void {
        const index = this.modifiers.findIndex((item) => item.id === id);
        if (index >= 0) {
            this.modifiers.splice(index, 1);
        }
    }

    public clear(): void {
        this.modifiers.length = 0;
    }
}
