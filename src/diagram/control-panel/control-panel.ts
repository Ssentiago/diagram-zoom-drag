import { Diagram } from '../diagram';
import { MovePanel } from './panelType/move';
import { ZoomPanel } from './panelType/zoom';
import { FoldPanel } from './panelType/fold';
import { ServicePanel } from './panelType/service';
import { updateButton } from './helpers/helpers';
import { DiagramData } from '../../settings/typing/interfaces';

export class ControlPanel {
    constructor(public diagram: Diagram) {}

    /**
     * Initializes the control panel for the diagram.
     *
     * This method creates the control panel and its associated panels (move, fold, zoom, and service).
     * It then assigns the control panel and its associated panels to the panels data object,
     * which is then stored in the state.
     *
     * @param container - The container element that will contain the control panel.
     * @param diagramData - The data for the diagram.
     */
    initialize(container: HTMLElement, diagramData: DiagramData): void {
        this.diagram.activeContainer = container;

        const controlPanel = container.createDiv();
        controlPanel.addClass('diagram-zoom-drag-control-panel');

        const move = new MovePanel(this.diagram, this);
        const zoom = new ZoomPanel(this.diagram, this);
        const fold = new FoldPanel(this.diagram, this);
        const service = new ServicePanel(this.diagram, this);

        this.diagram.state.initializeContainerPanels(
            controlPanel,
            move,
            fold,
            zoom,
            service
        );

        fold.initialize();

        if (
            this.diagram.plugin.settings.data.panels.local.panels.move.on &&
            diagramData.panels.move.on
        ) {
            move.initialize();
        }

        if (
            this.diagram.plugin.settings.data.panels.local.panels.zoom.on &&
            diagramData.panels.zoom.on
        ) {
            zoom.initialize();
        }

        if (
            this.diagram.plugin.settings.data.panels.local.panels.service.on &&
            diagramData.panels.service.on
        ) {
            service.initialize();
        }

        // if (
        //     this.diagram.plugin.settings.data.hideOnMouseOutDiagram ||
        //     this.diagram.activeContainer?.dataset.folded === 'true'
        // ) {
        //     [move, zoom, service].forEach((panel) => {
        //         panel.panel.removeClass('visible');
        //         panel.panel.addClass('hidden');
        //     });
        // }

        this.diagram.activeContainer?.appendChild(controlPanel);
    }

    /**
     * Creates a new panel element with the given CSS class and styles.
     *
     * This function is used to create the various control panels used in the diagram.
     * The control panels are created by calling this function with the desired CSS class
     * (e.g. 'move-panel', 'zoom-panel', etc.) and an object containing the styles for the
     * panel.
     *
     * @param cssClass The CSS class to add to the panel element.
     * @param styles An object containing the styles for the panel.
     * @returns The created panel element.
     */
    createPanel(cssClass: string, styles: object): HTMLElement {
        const controlPanel = this.diagram.panelsData?.controlPanel;
        const panel = controlPanel!.createEl('div');
        panel.addClass(cssClass);
        panel.addClass('diagram-zoom-drag-panel');
        panel.setCssStyles(styles);
        return panel;
    }

    /**
     * Creates a new button element with the given icon, action, title, and properties.
     *
     * This function is used to create buttons for the control panels used in the diagram.
     * The buttons are created with the given icon and title, and the action is called when the button is clicked.
     * The button is also styled according to the given properties.
     *
     * @param icon The icon to display on the button.
     * @param action The action to call when the button is clicked.
     * @param title The title of the button.
     * @param active Whether the button is active or not. If not active, the button is hidden.
     * @param id The id of the button element.
     * @returns The created button element.
     */
    createButton(
        icon: string,
        action: () => void,
        title: string,
        active = true,
        id: string | undefined = undefined
    ): HTMLElement {
        const button = document.createElement('button');
        button.className = 'button';
        button.id = id ?? '';

        if (active) {
            button.setCssStyles({
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background-color 0.2s ease',
            });
            updateButton(button, icon, title);

            this.diagram.plugin.context.view!.registerDomEvent(
                button,
                'click',
                action
            );

            this.diagram.plugin.context.view!.registerDomEvent(
                button,
                'mouseenter',
                () => {
                    button.setCssStyles({
                        color: 'var(--interactive-accent)',
                    });
                }
            );

            this.diagram.plugin.context.view!.registerDomEvent(
                button,
                'mouseleave',
                () => {
                    button.setCssStyles({
                        color: 'var(--text-muted)',
                    });
                }
            );
        } else {
            button.setCssStyles({
                visibility: 'hidden',
            });
        }

        return button;
    }
}
