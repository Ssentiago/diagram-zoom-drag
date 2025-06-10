import { MovePanel } from './panels/move';
import { ZoomPanel } from './panels/zoom';
import { FoldPanel } from './panels/fold';
import { ServicePanel } from './panels/service';
import Diagram from 'diagram/diagram';
import { PanelsTriggering } from '../../settings/typing/interfaces';

interface ControlPanelExternalImpact {
    containerHovered: boolean;
}

export enum TriggerType {
    MOUSE = 1 << 0,
    FOCUS = 1 << 1,
    KEYPRESS = 1 << 2,
    FOLD = 1 << 3,
    FORCE = 1 << 4,
}

export class ControlPanel {
    fold!: FoldPanel;
    move!: MovePanel;
    zoom!: ZoomPanel;
    service!: ServicePanel;
    controlPanel!: HTMLElement;

    constructor(public diagram: Diagram) {}

    initialize(): void {
        this.createControlPanel();
        this.createPanels();
        this.initializePanels();
        this.attachToContainer();
    }

    private createControlPanel(): void {
        this.controlPanel = this.diagram.container.createDiv();
        this.controlPanel.addClass('diagram-zoom-drag-control-panel');
    }

    private createPanels(): void {
        this.move = new MovePanel(this);
        this.zoom = new ZoomPanel(this);
        this.fold = new FoldPanel(this);
        this.service = new ServicePanel(this);
    }

    private initializePanels(): void {
        [this.move, this.zoom, this.fold, this.service].forEach((panel) =>
            panel.initialize()
        );
    }

    private attachToContainer(): void {
        this.diagram.container.appendChild(this.controlPanel);
    }

    show(triggerType: TriggerType = TriggerType.FORCE): void {
        [this.move, this.zoom, this.service, this.fold].forEach((panel) =>
            panel.show(triggerType)
        );
    }

    hide(triggerType: TriggerType = TriggerType.FORCE) {
        [this.move, this.zoom, this.service, this.fold].forEach((panel) =>
            panel.hide(triggerType)
        );
    }

    hasVisiblePanels(): boolean {
        return [this.move, this.zoom, this.service, this.fold].some((panel) =>
            panel.isVisible()
        );
    }
}
