import { PanelType } from '../typing/interfaces';
import { Platform, setIcon } from 'obsidian';
import { updateButton } from '../helpers/helpers';
import { Diagram } from '../../diagram';
import { ControlPanel } from '../control-panel';
import { EventID } from '../../../events-management/typing/constants';
import { PanelsChangedVisibility } from '../../../events-management/typing/interface';
import { PanelsTriggering } from '../../../settings/typing/interfaces';

export class ServicePanel implements PanelType {
    panel!: HTMLElement;
    hiding = false;

    constructor(
        private readonly diagram: Diagram,
        private readonly diagramControlPanel: ControlPanel
    ) {}

    /**
     * Initializes the service panel.
     *
     * This method creates the HTML element of the service panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.panel = this.createPanel();
        this.setupEventListeners();
    }

    /**
     * Returns an array of objects representing the buttons in the service panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The service panel has the following buttons:
     * - A button to hide and show the move and zoom panels.
     * - A button to open the diagram in fullscreen mode.
     * - A button to enable and disable native touch events for the diagram.
     *
     * @param container The container to which the service panel is attached.
     * @returns An array of objects representing the buttons in the service panel.
     */
    getButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        const buttons = [];
        if (
            this.diagram.plugin.settings.data.panels.local.panels.service
                .buttons.hide
        ) {
            buttons.push({
                icon: this.hiding ? 'eye-off' : 'eye',
                action: (): void => {
                    const panelsData = this.diagram.state.panelsData;

                    if (!panelsData?.panels) {
                        return;
                    }

                    this.hiding = !this.hiding;

                    [panelsData.panels.move, panelsData.panels.zoom].forEach(
                        (panel) => {
                            if (!panel.panel) {
                                return;
                            }

                            panel.panel.toggleClass('hidden', this.hiding);
                            panel.panel.toggleClass('visible', !this.hiding);
                        }
                    );

                    const button: HTMLElement | null = this.panel.querySelector(
                        '#hide-show-button-diagram'
                    );
                    if (!button) {
                        return;
                    }
                    updateButton(
                        button,
                        !this.hiding ? 'eye' : 'eye-off',
                        `${this.hiding ? 'Show' : 'Hide'} move and zoom panels`
                    );
                },
                title: `Hide move and zoom panels`,
                id: 'hide-show-button-diagram',
            });
        }
        if (
            this.diagram.plugin.settings.data.panels.local.panels.service
                .buttons.fullscreen
        ) {
            buttons.push({
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button: HTMLElement | null =
                        container.querySelector('#fullscreen-button');
                    if (!button) {
                        return;
                    }
                    if (!document.fullscreenElement) {
                        container.addClass('is-fullscreen');
                        await container.requestFullscreen({
                            navigationUI: 'auto',
                        });
                        updateButton(
                            button,
                            'minimize',
                            'Open in fullscreen mode'
                        );
                    } else {
                        container.removeClass('is-fullscreen');
                        await document.exitFullscreen();
                        updateButton(
                            button,
                            'maximize',
                            'Exit fullscreen mode'
                        );
                    }
                },
                title: 'Open in fullscreen mode',
                id: 'fullscreen-button',
            });
        }
        if (Platform.isMobileApp) {
            buttons.push({
                icon: this.diagram.nativeTouchEventsEnabled
                    ? 'circle-slash-2'
                    : 'hand',
                action: (): void => {
                    this.diagram.nativeTouchEventsEnabled =
                        !this.diagram.nativeTouchEventsEnabled;

                    const btn: HTMLElement | null = this.panel.querySelector(
                        '#native-touch-event'
                    );
                    if (!btn) {
                        return;
                    }

                    const nativeEvents = this.diagram.nativeTouchEventsEnabled;

                    updateButton(
                        btn,
                        this.diagram.nativeTouchEventsEnabled
                            ? 'circle-slash-2'
                            : 'hand',
                        `${nativeEvents ? 'Enable' : 'Disable'} move and pinch zoom`
                    );

                    this.diagram.plugin.showNotice(
                        `Native touches are ${nativeEvents ? 'enabled' : 'disabled'} now. 
            You ${nativeEvents ? 'cannot' : 'can'} move and pinch zoom diagram diagram.`
                    );
                },
                title: `${this.diagram.nativeTouchEventsEnabled ? 'Enable' : 'Disable'} move and pinch zoom`,
                id: 'native-touch-event',
            });
        }

        return buttons;
    }
    /**
     * Creates the HTML element of the service panel.
     *
     * The service panel is a container with absolute positioning that is placed at the top right of the diagram.
     * It contains buttons that provide additional functionality for the diagram.
     * The buttons are created using the `getButtons` method and are then appended to the panel.
     *
     * @returns The HTML element of the service panel.
     */
    createPanel(): HTMLElement {
        const servicePanel = this.diagramControlPanel.createPanel(
            'diagram-service-panel',
            {
                ...this.diagram.plugin.settings.data.panels.local.panels.service
                    .position,
                gridTemplateColumns: 'repeat(auto-fit, minmax(24px, 1fr))',
                gridAutoFlow: 'column',
            }
        );
        const settings = this.diagram.plugin.settings;

        servicePanel.toggleClass(
            'hidden',
            settings.data.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS &&
                !settings.data.panels.global.triggering.ignoreService
        );

        const serviceButtons = this.getButtons(this.diagram.activeContainer!);
        serviceButtons.forEach((btn) =>
            servicePanel.appendChild(
                this.diagramControlPanel.createButton(
                    btn.icon,
                    btn.action,
                    btn.title,
                    true,
                    btn.id
                )
            )
        );

        return servicePanel;
    }

    /**
     * Sets up event listeners for the service panel.
     *
     * This method registers event listeners for the fullscreen and visibility change events.
     * It listens for the 'fullscreenchange' event on the diagram container to handle changes
     * in fullscreen mode. It also subscribes to the PanelsChangedVisibility event to update
     * the visibility of move and zoom panels.
     *
     * - The fullscreen button is used to toggle fullscreen mode and updates its icon and tooltip
     *   to reflect the current state.
     * - The hide/show button updates its icon and tooltip based on the visibility of the move
     *   and zoom panels.
     */
    setupEventListeners(): void {
        const fullscreenButton: HTMLElement | null =
            this.panel.querySelector('#fullscreen-button');
        const container = this.diagram.activeContainer!;

        if (!fullscreenButton) {
            return;
        }

        this.diagram.plugin.context.view?.registerDomEvent(
            container,
            'fullscreenchange',
            this.onFullScreenChange.bind(this, container, fullscreenButton)
        );

        const hidingB: HTMLElement | null = this.panel.querySelector(
            '#hide-show-button-diagram'
        );

        this.diagram.plugin.observer.subscribe(
            this.diagram.plugin.app.workspace,
            EventID.PanelsChangedVisibility,
            async (e: PanelsChangedVisibility) => {
                const visible = e.data.visible;
                if (!hidingB) {
                    return;
                }
                this.hiding = !visible;
                updateButton(
                    hidingB,
                    this.hiding ? 'eye-off' : 'eye',
                    `${this.hiding ? 'Show' : 'Hide'} move and zoom panels`
                );
                setIcon(hidingB, this.hiding ? 'eye-off' : 'eye');
            }
        );
    }

    /**
     * Handles the change in fullscreen mode for the diagram container.
     *
     * This method is triggered when the fullscreen state of the container changes.
     * It resets the zoom and position of the diagram and updates the fullscreen
     * button's icon and tooltip based on the new fullscreen state.
     *
     * @param container - The HTML element representing the diagram container.
     * @param button - The button element to update with the corresponding icon
     * and tooltip for fullscreen mode.
     */
    private onFullScreenChange(
        container: HTMLElement,
        button: HTMLElement
    ): void {
        if (document.fullscreenElement) {
            requestAnimationFrame(() => {
                this.diagram.actions.resetZoomAndMove(container);
            });
            updateButton(button, 'minimize', 'Exit fullscreen mode');
        } else {
            requestAnimationFrame(() => {
                this.diagram.actions.resetZoomAndMove(container);
            });
            updateButton(button, 'maximize', 'Open in fullscreen mode');
        }
    }
}
