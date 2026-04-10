/**
 * UIManager
 * 负责全局 UI 的打开/关闭调度，不承载业务逻辑。
 */
export class UIManager {
    private uiMap = new Map<string, unknown>();
    public curui: unknown = null;

    public open(uiKey: string, data?: unknown): unknown {
        const ui = data ?? this.uiMap.get(uiKey) ?? null;
        if (ui !== null) {
            this.uiMap.set(uiKey, ui);
        }
        this.curui = ui;
        return ui;
    }

    public close(uiKey?: string): void {
        if (!uiKey) {
            this.curui = null;
            return;
        }
        this.uiMap.delete(uiKey);
        if (this.curui && this.curui === this.uiMap.get(uiKey)) {
            this.curui = null;
        }
    }

    public closeAll(): void {
        this.uiMap.clear();
        this.curui = null;
    }
}

export const uiManager = new UIManager();
(globalThis as { uiManager?: UIManager }).uiManager = uiManager;
