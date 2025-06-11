import Diagram from '../../diagram';

import { TriggerType } from '../../typing/constants';

export interface IControlPanel {
    diagram: Diagram;

    show(triggerType: TriggerType): void;

    hide(triggerType: TriggerType): void;

    controlPanel: HTMLElement;
}
