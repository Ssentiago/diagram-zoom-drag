import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';

import { SupportedDiagrams } from '../diagram/typing/constants';
import { normalizePath } from 'obsidian';
import {
    DebugLevel,
    DefaultSettings,
    PanelsTriggering,
} from './typing/interfaces';
import EventEmitter2 from 'eventemitter2';
import { SettingsMigration } from './settingsMigration';

type ProxyWrapperMode = 'Events' | 'Settings';

export function createSettingsProxy(
    plugin: DiagramZoomDragPlugin,
    obj: any,
    path: any[] = [],
    mode: ProxyWrapperMode = 'Settings'
) {
    return new Proxy(obj, {
        get(target, key) {
            const value = target[key];
            if (typeof value === 'object' && value !== null) {
                return createSettingsProxy(plugin, value, [...path, key]);
            }
            return value;
        },
        set(target, prop, value) {
            const oldValue = target[prop];
            target[prop] = value;
            const fullPath = [...path, prop].join('.');
            plugin.settings.eventBus?.emit(`settings.${fullPath}`, {
                eventName: `settings.${fullPath}`,
                oldValue,
                newValue: value,
            });

            return true;
        },

        deleteProperty(target, prop) {
            const oldValue = target[prop];
            const existed = prop in target;
            delete target[prop];

            if (existed) {
                const fullPath = [...path, prop].join('.');
                plugin.settings.eventBus?.emit(`settings.${fullPath}`, {
                    eventName: `settings.${fullPath}`,
                    operation: 'delete',
                    oldValue,
                    newValue: undefined,
                });
            }
            return true;
        },
    });
}

interface EventPath {
    $path: string;

    toString(): string;

    valueOf(): string;
}

export type EventsWrapper<T> = {
    [K in keyof T]: T[K] extends object ? EventsWrapper<T[K]> : EventPath;
} & {
    $path: string;
    $all: string;
    $deep: string;
    $children: string;
};

export function createEventsWrapper(obj: any, path: string[] = []) {
    return new Proxy(obj, {
        get(target: any, key: string) {
            if (key === '$path') {
                return `settings.${path.join('.')}`;
            }

            const basePath =
                path.length > 0 ? `settings.${path.join('.')}` : 'settings';

            if (key === '$all' || key === '$deep') {
                return `${basePath}.**`;
            }

            if (key === '$children') {
                return createEventsWrapper(obj, [...path, key]);
            }

            const value = target[key];

            if (typeof value !== 'object' || value === null) {
                const pathStr = `settings.${[...path, key].join('.')}`;
                return {
                    $path: pathStr,
                    $all: `${pathStr}.**`,
                    $deep: `${pathStr}.**`,
                    $children: `${pathStr}.*`,
                    toString: () => pathStr,
                    valueOf: () => pathStr,
                } as EventPath;
            }

            return createEventsWrapper(value, [...path, key]);
        },
    });
}
export default class SettingsManager {
    eventBus: EventEmitter2;
    events!: EventsWrapper<DefaultSettings>;
    data!: DefaultSettings;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.plugin = plugin;
        this.eventBus = new EventEmitter2({
            wildcard: true,
            delimiter: '.',
        });
    }

    /**
     * Retrieves the default settings for the plugin.
     * @returns {DefaultSettings} The default settings object.
     */
    get defaultSettings(): DefaultSettings {
        return {
            version: '5.3.0',
            diagrams: {
                folding: {
                    foldByDefault: false,
                    autoFoldOnFocusChange: false,
                },
                settingsPagination: {
                    perPage: 5,
                },
                size: {
                    expanded: {
                        width: {
                            value: 400,
                            unit: 'px',
                        },
                        height: {
                            value: 400,
                            unit: 'px',
                        },
                    },
                    folded: {
                        width: {
                            value: 200,
                            unit: 'px',
                        },
                        height: {
                            value: 200,
                            unit: 'px',
                        },
                    },
                },
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
            },
            panels: {
                global: {
                    triggering: {
                        mode: PanelsTriggering.ALWAYS,
                        ignoreService: true,
                    },
                },
                local: {
                    preset: '',
                    panels: {
                        service: {
                            on: true,
                            buttons: {
                                hide: true,
                                fullscreen: true,
                            },
                            position: {
                                top: '0px',
                                right: '0px',
                            },
                        },
                        move: {
                            on: true,
                            buttons: {
                                up: true,
                                down: true,
                                left: true,
                                right: true,
                                upLeft: true,
                                upRight: true,
                                downLeft: true,
                                downRight: true,
                            },
                            position: {
                                bottom: '0px',
                                right: '0px',
                            },
                        },
                        zoom: {
                            on: true,
                            buttons: {
                                in: true,
                                out: true,
                                reset: true,
                            },
                            position: {
                                top: '50%',
                                right: '0px',
                            },
                        },
                    },
                },
            },
            debug: {
                enabled: false,
                level: DebugLevel.None,
            },
        } as DefaultSettings;
    } /**
     * Loads and initializes the plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when settings have been successfully loaded and applied.
     */
    async loadSettings(): Promise<void> {
        const userSettings = await this.plugin.loadData();
        const result = SettingsMigration.migrate(userSettings);
        let settings: DefaultSettings;
        if (!result.success && result.errors) {
            this.plugin.logger.error(
                `Error loading settings: ${JSON.stringify(result.errors)}. Resetting to defaults...`
            );
            settings = this.defaultSettings;
        } else {
            // this.plugin.logger.info(
            //     `Settings migrated successfully to ${result.version}`
            // );
            settings = result.data!;
        }

        this.data = createSettingsProxy(this.plugin, {
            ...settings,
        });
        this.events = createEventsWrapper(settings);
    }

    /**
     * Saves the current plugin settings.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been successfully saved.
     */
    async saveSettings(): Promise<void> {
        const saveData = {
            ...this.data,
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
            existsPath &&
                (await this.plugin.app.vault.adapter.remove(configPath));
            await this.loadSettings();
        } else {
            throw new Error('DiagramZoomDrag: `No plugin dir found`');
        }
    }
}
