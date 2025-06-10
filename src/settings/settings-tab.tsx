import { App, PluginSettingTab } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { createRoot, Root } from 'react-dom/client';
import SettingsRoot from './components/SettingsRoot';
import React from 'react';

export class SettingsTab extends PluginSettingTab {
    private root: Root | undefined = undefined;

    constructor(
        public app: App,
        public plugin: DiagramZoomDragPlugin
    ) {
        super(app, plugin);
        this.containerEl.addClass('diagram-zoom-drag-settings');
    }

    display(): void {
        this.root = createRoot(this.containerEl);
        this.root.render(<SettingsRoot app={this.app} plugin={this.plugin} />);
    }

    /**
     * Hides the settings tab.
     *
     * This method unmounts the React root component and clears the container element.
     */
    hide(): void {
        this.plugin.settings.eventBus.removeAllListeners();

        this.root?.unmount();
        this.containerEl.empty();
    }
}
