import { modelManager } from '../../core/model/ModelManager';
import { enum_card_model_type } from '../CardEnum';
import { CardModelBase } from './CardModelBase';

/**
 * CardModelBuilder
 * 负责 card 模块模型的创建、注册和销毁。
 */
export class CardModelBuilder {
    public register(): void {
        modelManager.register(enum_card_model_type.card_main, CardModelBase);
    }

    public create(): CardModelBase {
        const model = modelManager.enable(enum_card_model_type.card_main) as CardModelBase;
        model.enabled = true;
        return model;
    }

    public destroy(): void {
        modelManager.disable(enum_card_model_type.card_main);
    }
}
