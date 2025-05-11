import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

import { SupportedDiagrams } from '../diagram/typing/constants';
import { normalizePath } from 'obsidian';
import { DefaultSettings } from './typing/interfaces';

export default class SettingsManager {
    constructor(public plugin: DiagramZoomDragPlugin) {
        this.plugin = plugin;
    }

    /**
     * Retrieves the default settings for the plugin.
     * @returns {DefaultSettings} The default settings object.
     */
    get defaultSettings(): DefaultSettings {
        return {
            supported_diagrams: Object.entries(SupportedDiagrams).map(
                ([key, value]) => ({
                    name: key,
                    selector: value,
                    on: true,
                    panels: {
                        move: {
                            on: true,
                        },
                        zoom: {
                            on: true,
                        },
                        service: {
                            on: true,
                        },
                    },
                })
            ),
            panelsConfig: {
                service: {
                    enabled: true,
                    position: {
                        top: '0px',
                        right: '0px',
                    },
                },
                move: {
                    enabled: true,
                    position: {
                        bottom: '0px',
                        right: '0px',
                    },
                },
                zoom: {
                    enabled: true,
                    position: {
                        top: '50%',
                        right: '0px',
                    },
                },
            },
            diagramsPerPage: 5,
            collapseByDefault: false,
            automaticCollapsingOnFocusChange: false,
            hideOnMouseOutDiagram: false,
            diagramExpandedWidth: { value: 400, unit: 'px' },
            diagramExpandedHeight: { value: 400, unit: 'px' },
            diagramCollapsedWidth: { value: 200, unit: 'px' },
            diagramCollapsedHeight: { value: 200, unit: 'px' },
            addHidingButton: true,
        };
    }

    /**
     * Loads and initializes the plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when settings have been successfully loaded and applied.
     */
    async loadSettings(): Promise<void> {
        const userSettings = await this.plugin.loadData();
        const defaultSettings = this.defaultSettings;
        const settings = Object.assign({}, defaultSettings, userSettings);
        this.plugin.settings = {
            ...settings,
        };
    }

    /**
     * Saves the current plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been successfully saved.
     */
    async saveSettings(): Promise<void> {
        const saveData = {
            ...this.plugin.settings,
        };
        await this.plugin.saveData(saveData);
    }

    /**
     * Resets the plugin settings to their default state.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been reset and the event has been published.
     */
    async resetSettings(): Promise<void> {
        const pluginPath = this.plugin.manifest.dir;
        if (pluginPath) {
            const configPath = normalizePath(`${pluginPath}/data.json`);
            const existsPath =
                await this.plugin.app.vault.adapter.exists(configPath);
            if (existsPath) {
                await this.plugin.app.vault.adapter.remove(configPath);
            }
            await this.loadSettings();
        }
    }
}
