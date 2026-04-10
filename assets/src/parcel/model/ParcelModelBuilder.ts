import { modelManager } from '../../core/model/ModelManager';
import { ParcelModelBase } from './ParcelModelBase';

const PARCEL_MAIN_MODEL_KEY = 'parcel_main';

export class ParcelModelBuilder {
    public register(): void {
        modelManager.register(PARCEL_MAIN_MODEL_KEY, ParcelModelBase);
    }

    public create(): ParcelModelBase {
        return modelManager.enable(PARCEL_MAIN_MODEL_KEY) as ParcelModelBase;
    }

    public destroy(): void {
        modelManager.disable(PARCEL_MAIN_MODEL_KEY);
    }
}
