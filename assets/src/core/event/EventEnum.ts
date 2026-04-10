/**
 * 事件定义统一集中在本文件，不做模块拆分。
 * 命名使用下划线风格，并通过前缀区分模块/公共事件。
 */

export const enum_app_event_key = {
    app_bootstrap_done: 'app_bootstrap_done',
    app_ui_open: 'app_ui_open',
    app_ui_close: 'app_ui_close',
    global_model_enabled: 'global_model_enabled',
} as const;

export type type_app_event_key = typeof enum_app_event_key[keyof typeof enum_app_event_key];

export interface interface_app_event_map {
    app_bootstrap_done: { source: string };
    app_ui_open: { uiKey: string; payload?: unknown };
    app_ui_close: { uiKey: string };
    global_model_enabled: { modelType: string };
}
