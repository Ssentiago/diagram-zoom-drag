import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { DiagramActions } from './actions/diagram-actions';
import { DiagramData } from '../settings/typing/interfaces';
import { ControlPanel } from './control-panel/control-panel';

export default class Diagram {
    actions: DiagramActions;
    controlPanel: ControlPanel;

    dx = 0;
    dy = 0;
    scale = 1;
    nativeTouchEventsEnabled!: boolean;
    diagramData!: DiagramData;

    constructor(
        public plugin: DiagramZoomDragPlugin,
        public container: HTMLElement,
        data: DiagramData
    ) {
        this.actions = new DiagramActions(this);
        this.controlPanel = new ControlPanel(this);
    }
}
