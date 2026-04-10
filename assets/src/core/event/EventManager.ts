import { interface_app_event_map, type_app_event_key } from './EventEnum';

type type_event_listener<T> = {
    target?: Object;
    handler: (eventData: T) => void;
    once?: boolean;
    priority: number;
};

/**
 * EventManager
 * 全局单例事件中心，提供 on/off/emit/once。
 */
export class EventManager {
    private eventMap = new Map<type_app_event_key, type_event_listener<any>[]>();

    public emit<T extends keyof interface_app_event_map>(eventName: T, eventData?: interface_app_event_map[T]): void {
        const list = this.eventMap.get(eventName);
        if (!list || list.length === 0) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            item.handler.call(item.target, eventData as interface_app_event_map[T]);
            if (item.once) {
                list.splice(i, 1);
                i--;
            }
        }
    }

    public on<T extends keyof interface_app_event_map>(
        eventName: T,
        eventHandler: (eventData: interface_app_event_map[T]) => void,
        target?: Object,
        once = false,
        priority = 0,
    ): void {
        let list = this.eventMap.get(eventName);
        if (!list) {
            list = [];
            this.eventMap.set(eventName, list);
        }
        list.push({ target, handler: eventHandler, once, priority });
        list.sort((a, b) => b.priority - a.priority);
    }

    public off<T extends keyof interface_app_event_map>(
        eventName: T,
        eventHandler?: (eventData: interface_app_event_map[T]) => void,
        target?: Object,
    ): void {
        const list = this.eventMap.get(eventName);
        if (!list) {
            return;
        }
        if (!eventHandler) {
            this.eventMap.set(
                eventName,
                list.filter((item) => item.target !== target),
            );
            return;
        }
        this.eventMap.set(
            eventName,
            list.filter((item) => item.target !== target || item.handler !== eventHandler),
        );
    }

    public targetOff(target: Object): void {
        this.eventMap.forEach((list, key) => {
            this.eventMap.set(
                key,
                list.filter((item) => item.target !== target),
            );
        });
    }

    public once<T extends keyof interface_app_event_map>(
        eventName: T,
        eventHandler: (eventData: interface_app_event_map[T]) => void,
        target?: Object,
        priority = 0,
    ): void {
        this.on(eventName, eventHandler, target, true, priority);
    }
}

export const eventManager = new EventManager();
(globalThis as { eventManager?: EventManager }).eventManager = eventManager;
