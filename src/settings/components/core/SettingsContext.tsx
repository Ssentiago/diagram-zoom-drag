import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import { App } from 'obsidian';
import DiagramZoomDragPlugin from '../../../core/diagram-zoom-drag-plugin';
import { DefaultSettings } from '../../typing/interfaces';
import { EventsWrapper } from '../../settings-manager';

interface SettingsContextProps {
    plugin: DiagramZoomDragPlugin;
    app: App;
    events: EventsWrapper<DefaultSettings>;
    forceReload: () => void;
    reloadCount: number;
    currentPath: string;
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

interface SettingProviderProps {
    app: App;
    plugin: DiagramZoomDragPlugin;
    children: React.ReactNode;
}

/**
 * Provides the Obsidian app, the plugin instance, a force reload function,
 * the reload count, the current path, and a function to set the current path
 * to its children.
 *
 * @param app The Obsidian app instance.
 * @param plugin The plugin instance.
 * @param children The children components of the provider.
 * @returns The children components wrapped in the context provider.
 */
export const SettingProvider = ({
    app,
    plugin,
    children,
}: SettingProviderProps): React.ReactElement => {
    const [reloadCount, setReloadCount] = useState(0);
    const [currentPath, setCurrentPath] = useState<string>('/diagram-section');
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const [events, setEvents] = useState(plugin.settings.events);

    const forceReload = useCallback(() => {
        setReloadCount((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const handler = () => {
            setEvents(plugin.settings.events);
        };

        plugin.settings.eventBus.on('settings-reset', handler);
        return () => {
            plugin.settings.eventBus.off('settings-reset', handler);
        };
    }, [plugin]);

    const contextValue: SettingsContextProps = useMemo(
        () => ({
            app,
            plugin,
            events: plugin.settings.events,
            forceReload,
            reloadCount,
            currentPath,
            setCurrentPath,
        }),
        [
            app,
            plugin,
            events,
            forceReload,
            reloadCount,
            currentPath,
            setCurrentPath,
            plugin.settings.events,
        ]
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * A React hook that returns the `SettingsContextProps` object.
 *
 * This hook should be used within a `SettingProvider` component. If used
 * outside of a `SettingProvider`, it will throw an error.
 *
 * @returns The `SettingsContextProps` object.
 */
export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error(
            'useSettingsContext must be used within a SettingProvider'
        );
    }
    return context;
};
