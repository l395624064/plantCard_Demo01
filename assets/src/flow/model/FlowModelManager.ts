import { FlowModelUtils } from './FlowModelUtils';

export class FlowModelManager {
    public readonly utils = new FlowModelUtils();
}

export const flowModelManager = new FlowModelManager();
