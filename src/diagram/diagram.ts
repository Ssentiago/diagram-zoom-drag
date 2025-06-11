import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { DiagramActions } from './actions/diagram-actions';
import { ControlPanel } from './control-panel/control-panel';
import { BaseDiagramDescriptor } from '../adapters/markdown-preview-adapter';
import { DiagramSize, SourceData } from '../adapters/base-adapter';
import Events from './events/events';
import { updateDiagramSize } from './helpers';

export interface FileStats {
    ctime: number;
    mtime: number;
    size: number;
}

export interface DiagramDescriptor extends BaseDiagramDescriptor {
    sourceData: SourceData;
    size: DiagramSize;
}

export default class Diagram {
    container: HTMLElement;
    id!: string;
    dx = 0;
    dy = 0;
    scale = 1;
    nativeTouchEventsEnabled!: boolean;
    diagramDescriptor: DiagramDescriptor;
    fileStats: FileStats;

    actions: DiagramActions;
    controlPanel: ControlPanel;
    events: Events;

    constructor(
        public plugin: DiagramZoomDragPlugin,
        container: HTMLElement,
        diagramDescriptor: DiagramDescriptor,
        fileStats: FileStats
    ) {
        this.container = container;
        this.diagramDescriptor = diagramDescriptor;
        this.fileStats = fileStats;

        this.actions = new DiagramActions(this);
        this.controlPanel = new ControlPanel(this);
        this.events = new Events(this);
    }

    initialize() {
        this.controlPanel.initialize();
        this.events.initialize();

        updateDiagramSize(
            this.container,
            this.diagramDescriptor.size,
            this.plugin.settings.data.diagrams.size,
            this.plugin.isInLivePreviewMode
        );

        this.actions.fitToContainer(
            this.diagramDescriptor.diagramElement,
            this.container
        );
    }

    cleanUp() {
        [this.events, this.controlPanel].forEach((obj) => obj.cleanUp());
    }
}
