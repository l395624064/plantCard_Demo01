import { ParcelModelBuilder } from './model/ParcelModelBuilder';
import { ParcelModelBase } from './model/ParcelModelBase';

export class ParcelManager {
    private readonly modelBuilder = new ParcelModelBuilder();
    private model: ParcelModelBase | null = null;
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

    public getModel(): ParcelModelBase | null {
        return this.model;
    }
}

export const parcelManager = new ParcelManager();
