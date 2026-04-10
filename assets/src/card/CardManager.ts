import { CardModelBuilder } from './model/CardModelBuilder';
import { CardModelBase } from './model/CardModelBase';

/**
 * CardManager
 * 仅负责 card 模块生命周期与对外协调。
 */
export class CardManager {
    private readonly modelBuilder = new CardModelBuilder();
    private model: CardModelBase | null = null;
    private inited = false;

    public init(): void {
        if (this.inited) {
            return;
        }
        this.modelBuilder.register();
        this.model = this.modelBuilder.create();
        this.addEvents();
        this.inited = true;
    }

    public addEvents(): void {
        // reserved
    }

    public offEvents(): void {
        // reserved
    }

    public dispose(): void {
        this.offEvents();
        this.modelBuilder.destroy();
        this.model = null;
        this.inited = false;
    }

    public getModel(): CardModelBase | null {
        return this.model;
    }
}

export const cardManager = new CardManager();
