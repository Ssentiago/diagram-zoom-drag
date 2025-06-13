import { ControlPanel } from '../control-panel';
import { PanelsTriggering } from '../../../settings/typing/interfaces';
import { BasePanel, ButtonsData } from './base-panel';
import { IControlPanel } from '../typing/interfaces';

enum ZoomButtons {
    In = 'in',
    Out = 'out',
    Reset = 'reset',
}

export class ZoomPanel extends BasePanel {
    buttons = new Map<ZoomButtons, ButtonsData>();

    constructor(controlPanel: IControlPanel) {
        super(controlPanel);
    }

    /**
     * Initializes the zoom panel.
     *
     * This method creates the HTML element of the zoom panel and assigns it to the `panel` property.
     */
    initialize(): void {
        super.initialize();
    }

    get enabled(): boolean {
        return (
            this.controlPanel.diagram.plugin.settings.data.panels.local.panels
                .zoom.on &&
            this.controlPanel.diagram.diagramDescriptor.diagramData.panels.zoom
                .on
        );
    }

    get cssClass() {
        return 'diagram-zoom-panel';
    }
    get cssStyles() {
        return {
            ...this.controlPanel.diagram.plugin.settings.data.panels.local
                .panels.zoom.position,
            transform: 'translateY(-50%)',
            gridTemplateColumns: '1fr',
        };
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
    getButtons(): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id: ZoomButtons;
    }> {
        const zoomBtn =
            this.controlPanel.diagram.plugin.settings.data.panels.local.panels
                .zoom.buttons;
        const buttons = [];

        if (zoomBtn.in) {
            buttons.push({
                id: ZoomButtons.In,
                icon: 'zoom-in',
                action: (): void =>
                    this.controlPanel.diagram.actions.zoomElement(1.1, true),
                title: 'Zoom In',
            });
        }
        if (zoomBtn.reset) {
            buttons.push({
                id: ZoomButtons.Reset,
                icon: 'refresh-cw',
                action: (): void =>
                    this.controlPanel.diagram.actions.resetZoomAndMove(true),
                title: 'Reset Zoom and Position',
            });
        }
        if (zoomBtn.out) {
            buttons.push({
                id: ZoomButtons.Out,
                icon: 'zoom-out',
                action: (): void =>
                    this.controlPanel.diagram.actions.zoomElement(0.9, true),
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
    setupPanelContents() {
        this.panel.toggleClass(
            'hidden',
            this.controlPanel.diagram.plugin.settings.data.panels.global
                .triggering.mode !== PanelsTriggering.ALWAYS
        );
        const zoomButtons = this.getButtons();
        zoomButtons.forEach((btn) =>
            this.panel.appendChild(
                this.createButton(btn.icon, btn.action, btn.title, true)
            )
        );
    }
}
