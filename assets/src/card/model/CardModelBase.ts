import { interface_card_model_state, type_card_id, type_card_label } from '../CardEnum';

/**
 * CardModelBase
 * 模块基础模型，字段统一通过 get/set 暴露，便于子类覆写。
 */
export class CardModelBase {
    private _id: type_card_id = '';
    private _label: type_card_label = '';
    private _enabled = false;

    public get id(): type_card_id {
        return this._id;
    }

    public set id(val: type_card_id) {
        this._id = val;
    }

    public get label(): type_card_label {
        return this._label;
    }

    public set label(val: type_card_label) {
        this._label = val;
    }

    public get enabled(): boolean {
        return this._enabled;
    }

    public set enabled(val: boolean) {
        this._enabled = val;
    }

    public getState(): interface_card_model_state {
        return {
            id: this.id,
            label: this.label,
            enabled: this.enabled,
        };
    }
}
