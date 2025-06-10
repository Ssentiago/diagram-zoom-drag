import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { State } from './state/state';
import { ControlPanel } from './control-panel/control-panel';
import Events from './events/events';
import { DiagramActions } from './actions/diagram-actions';
import { ContextMenu } from './context-menu/context-menu';
import { MarkdownPostProcessorContext } from 'obsidian';
import { DiagramSize, PanelsData } from './state/typing/interfaces';
import { AdapterFactory } from './adapters/adapter-factory';

export class Diagram {
    readonly state: State;
    readonly controlPanel: ControlPanel;
    readonly events: Events;
    readonly actions: DiagramActions;
    readonly contextMenu: ContextMenu;

    activeContainer: HTMLElement | undefined = undefined;

    dx!: number;
    dy!: number;
    scale!: number;
    nativeTouchEventsEnabled!: boolean;
    source!: string;
    panelsData!: PanelsData;
    livePreviewObserver!: MutationObserver | undefined;
    size!: DiagramSize;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.state = new State(this);
        this.actions = new DiagramActions(this);
        this.events = new Events(this);
        this.controlPanel = new ControlPanel(this);
        this.contextMenu = new ContextMenu(this);
    }

    async initialize(
        element: HTMLElement,
        context: MarkdownPostProcessorContext
    ): Promise<void>;

    async initialize(element: HTMLElement): Promise<void>;

    /**
     * Initializes the diagram by determining and using the appropriate adapter.
     *
     * This function selects a suitable adapter based on the current diagram state
     * and initializes it with the provided HTML element and optional context.
     * The adapter is responsible for handling different rendering modes such as
     * preview or live preview.
     *
     * @param element - The HTML element that represents the diagram.
     * @param context - Optional Markdown post-processing context
     *
     * @returns A promise that resolves once the adapter has been successfully initialized.
     */
    async initialize(
        element: HTMLElement,
        context?: MarkdownPostProcessorContext
    ): Promise<void> {
        const adapter = AdapterFactory.getSuitableAdapter(this);
        if (adapter) {
            await adapter.initialize(element, context);
        }
    }

    /**
     * Updates the size of a given diagram container.
     *
     * This method adjusts the dimensions of the container based on whether the diagram
     * is folded or expanded, using settings stored in the plugin. Sizes specified in
     * percentage units are converted to pixels based on the original size of the diagram.
     *
     * Additionally, if the plugin is in live preview mode, it updates the size of the
     * closest `.live-preview-parent`, which is a `cm-view` widget for live-preview.
     *
     * @param container - The HTML element representing the diagram container.
     */
    updateDiagramSize(container: HTMLElement): void {
        const isFolded = container.dataset.folded === 'true';

        const setting = isFolded
            ? this.plugin.settings.data.diagrams.size.folded
            : this.plugin.settings.data.diagrams.size.expanded;
        const originalDiagramSize = this.plugin.diagram.size;
        const heightValue = setting.height.value;
        const widthValue = setting.width.value;
        const heightInPx =
            setting.height.unit === '%'
                ? (heightValue / 100) * originalDiagramSize.height
                : heightValue;
        const widthInPx =
            setting.width.unit === '%'
                ? (widthValue / 100) * originalDiagramSize.width
                : widthValue;

        container.style.height = `${heightInPx}px`;
        container.style.width = `${widthInPx}px`;

        if (this.plugin.isInLivePreviewMode) {
            const parent = container.closest(
                '.live-preview-parent'
            ) as HTMLElement;
            parent.style.setProperty('height', `${heightInPx}px`, 'important');
            parent.style.setProperty('width', `${widthInPx}px`, 'important');
        }
    }
}
