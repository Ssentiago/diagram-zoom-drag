import { Platform } from 'obsidian';
import { updateButton } from '../helpers/helpers';
import { PanelsTriggering } from '../../../settings/typing/interfaces';
import { BasePanel, ButtonsData } from './base-panel';
import { IControlPanel } from '../typing/interfaces';
import { TriggerType } from '../../typing/constants';
import { button } from 'blessed';

enum ServiceButtons {
    Hide = 'hide',
    Fullscreen = 'fullscreen',
    Touch = 'touch',
}

export class ServicePanel extends BasePanel {
    buttons = new Map<ServiceButtons, ButtonsData>();

    constructor(controlPanel: IControlPanel) {
        super(controlPanel);
    }

    initialize(): void {
        super.initialize();
        this.setupEventListeners();
    }

    get enabled(): boolean {
        return (
            this.diagram.plugin.settings.data.panels.local.panels.service.on &&
            this.diagram.diagramDescriptor.diagramData.panels.service.on
        );
    }

    get cssClass() {
        return 'diagram-service-panel';
    }
    get cssStyles() {
        return {
            ...this.diagram.plugin.settings.data.panels.local.panels.service
                .position,
            gridTemplateColumns: 'repeat(auto-fit, minmax(24px, 1fr))',
            gridAutoFlow: 'column',
        };
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
    getButtons(): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id: ServiceButtons;
        dataAttributes?: {
            [key: string]: string;
        };
    }> {
        const buttons = [];
        const container = this.diagram.container;
        if (
            this.diagram.plugin.settings.data.panels.local.panels.service
                .buttons.hide
        ) {
            buttons.push({
                id: ServiceButtons.Hide,
                icon: 'eye',
                action: (): void => {
                    const button = this.buttons.get(ServiceButtons.Hide)
                        ?.element as HTMLButtonElement | undefined;
                    if (!button) {
                        return;
                    }
                    const isCurrentlyHiding = button.dataset.hiding === 'true';

                    const willBeHiding = !isCurrentlyHiding;

                    button.dataset.hiding = willBeHiding.toString();

                    isCurrentlyHiding
                        ? this.controlPanel.show(TriggerType.SERVICE_HIDING)
                        : this.controlPanel.hide(TriggerType.SERVICE_HIDING);

                    updateButton(
                        button,
                        !isCurrentlyHiding ? 'eye' : 'eye-off',
                        `${isCurrentlyHiding ? 'Show' : 'Hide'} move and zoom panels`
                    );
                },
                title: `Hide move and zoom panels`,
                dataAttributes: {
                    hiding: 'false',
                },
            });
        }
        if (
            this.diagram.plugin.settings.data.panels.local.panels.service
                .buttons.fullscreen
        ) {
            buttons.push({
                id: ServiceButtons.Fullscreen,
                icon: 'maximize',
                action: async (): Promise<void> => {
                    const button = this.buttons.get(ServiceButtons.Fullscreen)
                        ?.element as HTMLButtonElement | undefined;
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
            });
        }
        if (Platform.isMobileApp) {
            buttons.push({
                id: ServiceButtons.Touch,
                icon: this.diagram.nativeTouchEventsEnabled
                    ? 'circle-slash-2'
                    : 'hand',
                action: (): void => {
                    this.diagram.nativeTouchEventsEnabled =
                        !this.diagram.nativeTouchEventsEnabled;

                    const btn: HTMLElement | undefined = this.buttons.get(
                        ServiceButtons.Touch
                    )?.element;
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
    setupPanelContents() {
        const settings = this.diagram.plugin.settings;

        this.panel.toggleClass(
            'hidden',
            settings.data.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS &&
                !settings.data.panels.global.triggering.ignoreService
        );

        const serviceButtons = this.getButtons();
        serviceButtons.forEach((btn) => {
            const button = this.createButton(
                btn.icon,
                btn.action,
                btn.title,
                true,
                btn.id
            );
            if (btn.dataAttributes) {
                Object.entries(btn.dataAttributes).forEach(([key, value]) => {
                    button.setAttribute(key, value);
                });
            }
            this.buttons.set(btn.id, {
                element: button,
                listener: btn.action,
            });
            this.panel.appendChild(button);
        });
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
        const fullscreenButton: HTMLElement | undefined = this.buttons.get(
            ServiceButtons.Fullscreen
        )?.element;

        if (!fullscreenButton) {
            return;
        }

        this.diagram.plugin.context.view?.registerDomEvent(
            this.diagram.container,
            'fullscreenchange',
            this.onFullScreenChange
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
    private onFullScreenChange = (): void => {
        const button: HTMLElement | undefined = this.buttons.get(
            ServiceButtons.Fullscreen
        )?.element;
        if (!button) {
            return;
        }
        if (document.fullscreenElement) {
            requestAnimationFrame(() => {
                this.diagram.actions.resetZoomAndMove();
            });
            updateButton(button, 'minimize', 'Exit fullscreen mode');
        } else {
            requestAnimationFrame(() => {
                this.diagram.actions.resetZoomAndMove();
            });
            updateButton(button, 'maximize', 'Open in fullscreen mode');
        }
    };

    protected get supportedTriggers(): number {
        const base = super.supportedTriggers & ~TriggerType.SERVICE_HIDING;
        const shouldIgnoreExternalTriggers =
            this.diagram.plugin.settings.data.panels.global.triggering
                .ignoreService;

        if (!shouldIgnoreExternalTriggers) {
            return base;
        }

        const unSupportedFlags = TriggerType.MOUSE | TriggerType.FOCUS;
        return base & ~unSupportedFlags;
    }
}
