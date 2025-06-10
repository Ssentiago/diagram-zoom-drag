import React from 'react';

import { App } from 'obsidian';
import { SettingProvider } from './core/SettingsContext';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';
import SettingsPage from './settings-page/SettingsPage';

/**
 * The root component of the settings UI.
 *
 * This component is responsible for rendering the settings page. It also provides
 * a context for the settings page to access the app and the plugin.
 *
 * @param app The Obsidian app instance.
 * @param plugin The instance of the DiagramZoomDragPlugin.
 */
const SettingsRoot: React.FC<{
    app: App;
    plugin: DiagramZoomDragPlugin;
}> = ({ app, plugin }) => (
    <SettingProvider app={app} plugin={plugin}>
        <SettingsPage />
    </SettingProvider>
);

export default SettingsRoot;
