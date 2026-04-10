export class ParcelMainUI {
    private opened = false;

    public open(data?: unknown): void {
        this.opened = true;
        void data;
    }

    public close(): void {
        this.opened = false;
    }
}
