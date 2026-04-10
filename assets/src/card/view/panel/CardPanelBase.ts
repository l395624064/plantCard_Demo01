export class CardPanelBase {
    private visible = false;

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }

    public isVisible(): boolean {
        return this.visible;
    }
}
