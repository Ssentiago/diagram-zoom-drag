import {
    MarkdownPostProcessorContext,
    MarkdownView,
    Notice,
    Plugin,
} from 'obsidian';
import SettingsManager from '../settings/settings-manager';
import { SettingsTab } from '../settings/settings-tab';
import PluginStateChecker from './plugin-state-checker';
import {
    EventObserver,
    EventPublisher,
} from '../events-management/events-management';
import { Diagram } from '../diagram/diagram';
import { PluginContext } from './plugin-context';
import { EventID } from '../events-management/typing/constants';
import { PanelsChangedVisibility } from '../events-management/typing/interface';
import Logger from '../logger/logger';

export default class DiagramZoomDragPlugin extends Plugin {
    context!: PluginContext;

    settings!: SettingsManager;
    pluginStateChecker!: PluginStateChecker;
    publisher!: EventPublisher;
    observer!: EventObserver;
    diagram!: Diagram;
    logger!: Logger;

    /**
     * Initializes the plugin.
     *
     * This function initializes the plugin's core components, event system, and utilities.
     * It is called when the plugin is loading.
     *
     * @returns A promise that resolves when the plugin has been successfully initialized.
     */
    async initializePlugin(): Promise<void> {
        await this.initializeCore();
        await this.initializeUI();
        await this.initializeEventSystem();
        await this.initializeUtils();
    }

    /**
     * Initializes the plugin's core components.
     *
     * This function initializes the plugin's settings manager and adds a settings tab to the Obsidian settings panel.
     *
     * @returns A promise that resolves when the plugin's core components have been successfully initialized.
     */
    async initializeCore(): Promise<void> {
        this.settings = new SettingsManager(this);
        await this.settings.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));
        this.context = new PluginContext();
    }

    /**
     * Asynchronously initializes the event system for handling events in the plugin.
     * This function sets up the EventPublisher and EventObserver instances, and registers event handlers for 'layout-change' and 'active-leaf-change' events.
     *
     * @returns A promise that resolves once the event system has been successfully initialized.
     */
    async initializeEventSystem(): Promise<void> {
        this.publisher = new EventPublisher(this);
        this.observer = new EventObserver(this);

        this.registerMarkdownPostProcessor(
            async (
                element: HTMLElement,
                context: MarkdownPostProcessorContext
            ) => {
                this.initializeView();
                if (this.isInLivePreviewMode) {
                    return;
                }
                await this.diagram.initialize(element, context);
            }
        );
        this.registerEvent(
            this.app.workspace.on('layout-change', async () => {
                this.cleanupView();
                await this.diagram.state.cleanupContainers();
                this.initializeView();
                if (this.context.isValid && this.isInLivePreviewMode) {
                    await this.diagram.initialize(this.context.view!.contentEl);
                }
            })
        );
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', async () => {
                this.cleanupView();
                this.initializeView();
                if (this.context.isValid && this.isInLivePreviewMode) {
                    await this.diagram.initialize(this.context.view!.contentEl);
                }
            })
        );
    }

    /**
     * Initializes the user interface for the plugin.
     *
     * this function initializes the diagram manager and adds a command to toggle the control panel visibility of the current active diagram.
     *
     * @returns A promise that resolves once the user interface has been successfully initialized.
     */
    async initializeUI(): Promise<void> {
        this.diagram = new Diagram(this);

        // TODO переписать, оставить только публикацию события - которое будет слушать fold-панель
        this.addCommand({
            id: 'diagram-zoom-drag-toggle-panels-management-state',
            name: 'Toggle control panel visibility of current active diagram',
            checkCallback: (checking) => {
                if (checking) {
                    return !!this.diagram.activeContainer;
                }

                // this.publisher.publish({
                //     eventID: EventID.TogglePanelsVisibility,
                //     timestamp: new Date(),
                //     emitter: this.app.workspace,
                //     data: {
                //         scope: 'all',
                //     },
                // })

                const panelsData = this.diagram.panelsData.panels;

                if (!panelsData) {
                    return;
                }

                const panels = Object.values(panelsData);
                const isAnyHidden = panels.some((panel) => panel.panel.hidden);

                panels.forEach((panel) => {
                    panel.panel.toggleClass('hidden', isAnyHidden);
                    panel.panel.toggleClass('visible', !isAnyHidden);
                });

                this.publisher.publish({
                    eventID: EventID.PanelsChangedVisibility,
                    timestamp: new Date(),
                    emitter: this.app.workspace,
                    data: {
                        visible: true,
                    },
                } as PanelsChangedVisibility);
            },
        });
    }

    /**
     * Initializes the plugin's utility classes.
     *
     * This function initializes the PluginStateChecker, which is responsible for
     * checking if the plugin is being opened for the first time
     *
     * @returns A promise that resolves when the plugin's utilities have been
     *          successfully initialized.
     */
    async initializeUtils(): Promise<void> {
        this.pluginStateChecker = new PluginStateChecker(this);
        this.logger = new Logger(this);
        await this.logger.init();
        this.logger.info('Logger initialized');
        debugger;
        await this.logger.saveLogsToFile(this.logger.exportLogs());
    }

    /**
     * Initializes the plugin when it is loaded.
     *
     * This function is called automatically when the plugin is loaded by Obsidian.
     * It initializes the plugin by calling `initializePlugin`.
     *
     * @returns A promise that resolves when the plugin has been fully initialized.
     */
    async onload(): Promise<void> {
        await this.initializePlugin();
        console.log('initialize');
    }

    /**
     * Unloads the plugin and cleans up resources.
     *
     * This function is called automatically by Obsidian when the plugin is unloaded.
     * It unsubscribes all event listeners and cleans up any other resources that the plugin may have allocated.
     *
     * @returns {void} Void.
     */
    onunload(): void {
        // TODO do not forget about observers
        this.observer.unsubscribeAll();
    }

    /**
     * Initializes the view's diagram data when it becomes active.
     *
     * This method gets the currently active view, and if it is a MarkdownView,
     * it updates the context with the view and its leaf, and initializes the
     * diagram data for the leaf.
     *
     * @returns {void} Void.
     */
    initializeView(): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        const leaf = view.leaf;
        this.context.leaf = leaf;
        this.context.view = view;

        this.diagram.state.initializeLeafData(this.context.leafID!);
    }

    /**
     * Cleans up the view when it becomes inactive.
     *
     * This method gets the currently active leaf, and if it is not found,
     * it cleans up the diagram data for the leaf and resets the context.
     *
     * @returns {void} Void.
     */
    cleanupView(): void {
        if (this.context?.leaf) {
            const isLeaf = this.app.workspace.getLeafById(this.context.leaf.id);
            if (isLeaf === null) {
                this.context.view = undefined;
                this.diagram.state.cleanupData(this.context.leafID!);
                this.context.leaf = undefined;
            }
        }
    }

    /**
     * Displays a notice with the provided message for a specified duration.
     *
     * @param message - The message to display in the notice.
     * @param duration - The duration in milliseconds for which the notice should be displayed. Defaults to undefined.
     * @returns void
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }

    /**
     * Checks if the current view is in preview mode.
     *
     * This getter retrieves the state of the current view and checks
     * if the mode is set to 'preview', indicating that the view is in
     * preview mode rather than edit or source mode.
     *
     * @returns {boolean} True if the current view is in preview mode, otherwise false.
     */
    get isInPreviewMode(): boolean {
        const viewState = this.context?.view?.getState();
        return viewState?.mode === 'preview';
    }

    /**
     * Checks if the current view is in live preview mode.
     *
     * This getter checks two conditions to determine if the current view is in
     * live preview mode:
     *
     * 1. The boolean `source` state is `false`, which means the view is not in
     *    the standard Source mode.
     * 2. The `mode` state is set to `'source'`, which means the view is in a
     *    special "source" mode, which is Live Preview.
     *
     * If both conditions are true, then the view is in live preview mode.
     *
     * @returns {boolean} True if the current view is in live preview mode, otherwise false.
     */
    get isInLivePreviewMode(): boolean {
        const viewState = this.context?.view?.getState();
        return !viewState?.source && viewState?.mode === 'source';
    }
}
