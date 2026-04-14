export type type_parcel_id = string;
export type type_parcel_name = string;
export type type_parcel_state = 'idle' | 'active';
export type ParcelType = 'Crackedland' | 'desert' | 'grassland' | 'mossland' | 'snowfield' | 'wasteland' | 'mudland';
export type ParcelModifierType = 'fertile' | 'moist';
export type ParcelStructureType = 'none' | 'waterway' | 'wall';

export enum enum_parcel_model_type {
    parcel_main = 'parcel_main',
}

export interface interface_parcel_model_state {
    id: type_parcel_id;
    name: type_parcel_name;
    state: type_parcel_state;
}
