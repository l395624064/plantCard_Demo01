type type_model_ctor<T> = new () => T;

/**
 * ModelManager
 * 统一注册、启用、获取和销毁模块模型实例。
 */
export class ModelManager {
    private ctorMap = new Map<string, type_model_ctor<unknown>>();
    private modelMap = new Map<string, unknown>();

    public register(type: string, ctor: type_model_ctor<unknown>): void {
        this.ctorMap.set(type, ctor);
    }

    public enable(type: string): unknown {
        if (this.modelMap.has(type)) {
            return this.modelMap.get(type) ?? null;
        }
        const ctor = this.ctorMap.get(type);
        if (!ctor) {
            throw new Error(`[ModelManager] model type not registered: ${type}`);
        }
        const instance = new ctor();
        this.modelMap.set(type, instance);
        return instance;
    }

    public get<T>(type: string): T | null {
        return (this.modelMap.get(type) as T | undefined) ?? null;
    }

    public disable(type: string): void {
        this.modelMap.delete(type);
    }

    public destroy(type: string): void {
        this.modelMap.delete(type);
        this.ctorMap.delete(type);
    }
}

export const modelManager = new ModelManager();
(globalThis as { modelManager?: ModelManager }).modelManager = modelManager;
