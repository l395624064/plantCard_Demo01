export class ParcelItemBase {
    private active = false;

    public setActive(value: boolean): void {
        this.active = value;
    }

    public isActive(): boolean {
        return this.active;
    }
}
