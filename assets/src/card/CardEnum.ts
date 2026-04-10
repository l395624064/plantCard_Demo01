export type type_card_id = string;
export type type_card_label = string;
export type type_card_payload = {
    id: type_card_id;
    label: type_card_label;
};

export enum enum_card_model_type {
    card_main = 'card_main',
}

export interface interface_card_model_state {
    id: type_card_id;
    label: type_card_label;
    enabled: boolean;
}
