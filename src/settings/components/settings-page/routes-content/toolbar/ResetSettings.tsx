import React from 'react';
import { ButtonComponent, Notice } from 'obsidian';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../../core/SettingsContext';
import { useLocation } from 'react-router-dom';

/**
 * A React component that renders a button to reset settings to their default values.
 *
 * This component uses `ReactObsidianSetting` to add a button with an icon and
 * tooltip. When clicked, it resets the plugin settings, reloads the settings,
 * updates the CSS properties, and displays a notice to the user.
 *
 * It also updates the current path in the settings context based on the current
 * location.
 *
 * @returns A React element for resetting settings.
 */
const ResetSettings: React.FC = () => {
    const { plugin, forceReload, setCurrentPath } = useSettingsContext();

    const location = useLocation();

    return (
        <ReactObsidianSetting
            addButtons={[
                (button): ButtonComponent => {
                    button.setIcon('rotate-ccw');
                    button.setTooltip('Reset settings to default');
                    button.onClick(async () => {
                        setCurrentPath(location.pathname);
                        await plugin.settings.resetSettings();
                        plugin.settings.eventBus.emit('settings-reset');
                        forceReload();
                        plugin.showNotice(
                            'Settings have been reset to default.'
                        );
                    });
                    return button;
                },
            ]}
        />
    );
};

export default ResetSettings;
