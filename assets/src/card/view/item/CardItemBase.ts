export class CardItemBase {
    private _selected = false;

    public get selected(): boolean {
        return this._selected;
    }

    public set selected(val: boolean) {
        this._selected = val;
    }
}
