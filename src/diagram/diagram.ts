import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { DiagramActions } from './actions/diagram-actions';
import { ControlPanel } from './control-panel/control-panel';
import { BaseDiagramDescriptor } from '../adapters/markdown-preview-adapter';
import { DiagramSize, SourceData } from '../adapters/base-adapter';
import Events from './events/events';
import { updateDiagramSize } from './helpers';
import { Component } from 'obsidian';

export interface FileStats {
    ctime: number;
    mtime: number;
    size: number;
}

export interface DiagramDescriptor extends BaseDiagramDescriptor {
    sourceData: SourceData;
    size: DiagramSize;
}

export default class Diagram extends Component {
    container: HTMLElement;
    originalParent: HTMLElement;
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
        super();
        this.container = container;
        this.originalParent = container.parentNode as HTMLElement;

        this.diagramDescriptor = diagramDescriptor;
        this.fileStats = fileStats;

        this.actions = new DiagramActions(this);
        this.controlPanel = new ControlPanel(this);
        this.events = new Events(this);
        this.addChild(this.events);
        this.addChild(this.controlPanel);
        this.load();
    }

    initialize(): void {
        this.plugin.logger.debug(`Initialize diagram with id ${this.id}`);
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

    restoreOriginalDom(): void {
        console.log('=== ORIGINAL DOM RESTORING START ===');
        const element = this.diagramDescriptor.diagramElement;
        element.setCssStyles({
            transform: 'none',
            transition: 'none',
        });
        const originalParent = this.originalParent;
        originalParent.removeClass('live-preview-parent');
        element.removeClass('diagram-content');
        this.container.remove();
        originalParent.appendChild(element);
        console.log('=== ORIGINAL DOM RESTORING END ===');
    }

    onunload(): void {
        console.log('=== DIAGRAM UNLOAD START ===');
        this.restoreOriginalDom();
        super.onunload();
        console.log('=== DIAGRAM UNLOAD END ===');
    }
}
