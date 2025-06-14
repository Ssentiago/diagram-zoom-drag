import React, { useCallback, useState } from 'react';
import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import { useSettingsContext } from '../../core/SettingsContext';
import { DebugLevel } from '../../../typing/interfaces';

/**
 * The debug settings component.
 *
 * Provides settings for debugging, including logging enablement and level
 * selection, log export and copying, and clearing of log storage.
 *
 * @returns The debug settings component.
 */
const Debug: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [reload, setReload] = useState(false);

    const downloadLogs = useCallback(() => {
        const logs = plugin.logger.exportLogs();
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram-zoom-drag-logs.txt';
        link.click();
        URL.revokeObjectURL(url);
    }, [plugin.logger]);

    return (
        <>
            <ReactObsidianSetting
                name="Report an issue"
                addMultiDesc={(multidesc) => {
                    multidesc.addDescriptions([
                        'If you encounter any issues or have suggestions, please report them on GitHub.',
                        'How to report an issue:',
                        '1. Enable debug logging below and set level to `Debug`.',
                        'Warning: This may impact performance temporarily.',
                        '2. Reproduce the issue with logging enabled.',
                        '3. Export logs using the button below.',
                        '4. Click "Report an issue" and fill out the form.',
                        '5. Attach the exported log file.',
                        '6. Submit the issue.',
                    ]);

                    return multidesc;
                }}
                addButtons={[
                    (button) => {
                        button.setIcon('bug');
                        button.setTooltip('Report an issue');
                        button.onClick(async () => {
                            const systemInfo = JSON.stringify(
                                plugin.logger.getShortSystemInfo(),
                                null,
                                2
                            );
                            const issueBody = encodeURIComponent(
                                `## Issue Description\n` +
                                    `[Describe your issue here]\n\n` +
                                    `## Steps to Reproduce\n` +
                                    `1. [First step]\n` +
                                    `2. [Second step]\n\n` +
                                    `## System info\n` +
                                    `${systemInfo}\n\n`
                            );
                            const githubUrl =
                                `https://github.com/Ssentiago/diagram-zoom-drag/issues/new?` +
                                `title=${encodeURIComponent('[Bug Report] ')}&` +
                                `labels=bug&` +
                                `body=${issueBody}`;
                            window.open(githubUrl, '_blank');
                        });
                        return button;
                    },
                ]}
            />

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
                            none: 'None',
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
                name={'About exported logs'}
                addMultiDesc={(multiDesc) => {
                    multiDesc.addDescriptions([
                        'Exported logs contain:',
                        '• Complete system information (OS, hardware, plugins)',
                        '• Debug events with timestamps',
                        '• Performance metrics',
                        'Review logs before sharing - remove sensitive data if needed.',
                    ]);
                    return multiDesc;
                }}
            />

            <ReactObsidianSetting
                name={'Export logs'}
                addButtons={[
                    (button) => {
                        button.setIcon('download');
                        button.setTooltip('Export logs');
                        button.onClick(downloadLogs);
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
