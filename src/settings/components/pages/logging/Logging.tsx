// Logger.tsx
import React, { useState } from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from '../../core/SettingsContext';
import { normalizePath, Platform } from 'obsidian';
import { DebugLevel } from '../../../typing/interfaces';

const Debug: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [reload, setReload] = useState(false);

    return (
        <>
            <ReactObsidianSetting
                name={'Enable logging'}
                desc={'Enable debug logging for troubleshooting'}
                addToggles={[
                    (toggle) => {
                        toggle.setValue(plugin.settings.data.debug.enabled);
                        toggle.onChange(async (value) => {
                            plugin.settings.data.debug.enabled = value;
                            await plugin.settings.saveSettings();
                        });
                        return toggle;
                    },
                ]}
            />

            <ReactObsidianSetting
                name={'Log level'}
                desc={'Set minimum log level to display'}
                addDropdowns={[
                    (dropdown) => {
                        dropdown.addOptions({
                            error: 'Error',
                            warn: 'Warning',
                            info: 'Info',
                            debug: 'Debug',
                        });
                        dropdown.setValue(plugin.settings.data.debug.level);
                        dropdown.onChange(async (value) => {
                            plugin.settings.data.debug.level =
                                value as DebugLevel;
                            await plugin.settings.saveSettings();
                        });

                        return dropdown;
                    },
                ]}
            />

            <ReactObsidianSetting
                name={'Export logs'}
                addButtons={[
                    (button) => {
                        button.setIcon('download');
                        button.setTooltip('Export logs');
                        button.onClick(async () => {
                            const logString = plugin.logger.exportLogs();
                            const logBlob = new Blob([logString], {
                                type: 'text/plain',
                            });
                            const logUrl = URL.createObjectURL(logBlob);
                            const downloadLink = document.createElement('a');
                            downloadLink.href = logUrl;
                            downloadLink.download = 'logs.log';
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                            URL.revokeObjectURL(logUrl);
                        });

                        return button;
                    },
                ]}
            />
            <ReactObsidianSetting
                name={'Copy logs'}
                addButtons={[
                    (button) => {
                        button.setIcon('clipboard');
                        button.setTooltip('Copy logs to clipboard');
                        button.onClick(async () => {
                            const logString = plugin.logger.exportLogs();
                            if (logString.trim() === '') {
                                plugin.showNotice('No logs data found');
                                return;
                            }
                            await navigator.clipboard.writeText(logString);
                            plugin.showNotice('Logs was copied to clipboard');
                        });
                        return button;
                    },
                ]}
            />

            <ReactObsidianSetting
                name={'Clear logs storage'}
                desc={`Storage: ${plugin.logger.getStorageUsage()}, Entries: ${plugin.logger.getAllLogs().length}`}
                addButtons={[
                    (button) => {
                        button.setIcon('trash');
                        button.setTooltip('Clear logs storage');
                        button.onClick(async () => {
                            plugin.logger.clearAllLogs();
                            setReload((prev) => !prev);
                            plugin.showNotice('Logs storage was cleared');
                        });
                        return button;
                    },
                ]}
            />
        </>
    );
};

export default Debug;
