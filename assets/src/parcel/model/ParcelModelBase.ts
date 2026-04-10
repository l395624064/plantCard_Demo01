import { interface_parcel_model_state, type_parcel_id, type_parcel_name, type_parcel_state } from '../ParcelEnum';

export class ParcelModelBase {
    private _id: type_parcel_id = '';
    private _name: type_parcel_name = '';
    private _state: type_parcel_state = 'idle';

    public get id(): type_parcel_id {
        return this._id;
    }

    public set id(val: type_parcel_id) {
        this._id = val;
    }

    public get name(): type_parcel_name {
        return this._name;
    }

    public set name(val: type_parcel_name) {
        this._name = val;
    }

    public get state(): type_parcel_state {
        return this._state;
    }

    public set state(val: type_parcel_state) {
        this._state = val;
    }

    public getState(): interface_parcel_model_state {
        return {
            id: this.id,
            name: this.name,
            state: this.state,
        };
    }
}
