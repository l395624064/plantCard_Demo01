export class ParcelPanelBase {
    private shown = false;

    public show(): void {
        this.shown = true;
    }

    public hide(): void {
        this.shown = false;
    }
}
