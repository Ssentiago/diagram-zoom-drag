import { ControlPanel } from '../control-panel';
import { PanelType } from '../typing/interfaces';
import { Diagram } from '../../diagram';
import { PanelsTriggering } from '../../../settings/typing/interfaces';

export class ZoomPanel implements PanelType {
    panel!: HTMLElement;

    constructor(
        private readonly diagram: Diagram,
        private readonly diagramControlPanel: ControlPanel
    ) {}

    /**
     * Initializes the zoom panel.
     *
     * This method creates the HTML element of the zoom panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.panel = this.createPanel();
    }

    /**
     * Returns an array of objects representing the buttons in the zoom panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The zoom panel has 3 buttons:
     * - A button to zoom in.
     * - A button to reset zoom and move to the default state.
     * - A button to zoom out.
     *
     * @param container The container to which the zoom panel is attached.
     * @returns An array of objects representing the buttons in the zoom panel.
     */
    getButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        const zoomBtn =
            this.diagram.plugin.settings.data.panels.local.panels.zoom.buttons;
        const buttons = [];

        if (zoomBtn.in) {
            buttons.push({
                icon: 'zoom-in',
                action: (): void =>
                    this.diagram.actions.zoomElement(container, 1.1, true),
                title: 'Zoom In',
            });
        }
        if (zoomBtn.reset) {
            buttons.push({
                icon: 'refresh-cw',
                action: (): void =>
                    this.diagram.actions.resetZoomAndMove(container, true),
                title: 'Reset Zoom and Position',
            });
        }
        if (zoomBtn.out) {
            buttons.push({
                icon: 'zoom-out',
                action: (): void =>
                    this.diagram.actions.zoomElement(container, 0.9, true),
                title: 'Zoom Out',
            });
        }

        return buttons;
    }
    /**
     * Creates the HTML element of the zoom panel.
     *
     * The zoom panel is a container with absolute positioning that is placed at the right middle of the diagram.
     * It contains 3 buttons that zoom in, reset zoom and position, and zoom out the diagram.
     * The buttons are created using the `getButtons` method and are then appended to the panel.
     *
     * @returns The HTML element of the zoom panel.
     */
    createPanel(): HTMLElement {
        const zoomPanel = this.diagramControlPanel.createPanel(
            'diagram-zoom-panel',
            {
                ...this.diagram.plugin.settings.data.panels.local.panels.zoom
                    .position,
                transform: 'translateY(-50%)',
                gridTemplateColumns: '1fr',
            }
        );
        zoomPanel.toggleClass(
            'hidden',
            this.diagram.plugin.settings.data.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS
        );
        const zoomButtons = this.getButtons(this.diagram.activeContainer!);
        zoomButtons.forEach((btn) =>
            zoomPanel.appendChild(
                this.diagramControlPanel.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    true
                )
            )
        );

        return zoomPanel;
    }
}
