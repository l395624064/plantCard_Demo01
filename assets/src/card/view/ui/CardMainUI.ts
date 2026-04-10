/**
 * CardMainUI
 * 仅保留最小 UI 生命周期接口，业务后续扩展。
 */
export class CardMainUI {
    private opened = false;

    public open(data?: unknown): void {
        this.opened = true;
        void data;
    }

    public close(): void {
        this.opened = false;
    }

    public isOpened(): boolean {
        return this.opened;
    }
}
