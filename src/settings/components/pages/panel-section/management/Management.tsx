import { ReactObsidianSetting } from 'react-obsidian-setting';
import React, { useEffect, useRef } from 'react';
import LayoutModal from './components/modals/LayoutModal';
import { useSettingsContext } from '../../../core/SettingsContext';
import ButtonManagementModal from './components/modals/ButtonManagementModal';

const UI_PRIORITY = {
    TOGGLE: 1,
    BUTTON: 2,
} as const;

const Management: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [layoutModalOpen, setLayoutModalOpen] = React.useState(false);
    const [buttonModalOpen, setButtonModalOpen] = React.useState(false);

    const isApplyingPreset = useRef(false);

    const presets = {
        mobile: {
            zoom: { in: true, out: true, reset: false },
            move: {
                up: false,
                down: false,
                left: false,
                right: false,
                upRight: false,
                downRight: false,
                upLeft: false,
                downLeft: false,
            },
            service: { hide: true, fullscreen: false },
        },
        desktop: {
            zoom: { in: true, out: true, reset: true },
            move: {
                up: true,
                down: true,
                left: true,
                right: true,
                upRight: true,
                downRight: true,
                upLeft: true,
                downLeft: true,
            },
            service: { hide: true, fullscreen: true },
        },
        presentation: {
            zoom: { in: true, out: true, reset: true },
            move: {
                up: false,
                down: false,
                left: false,
                right: false,
                upRight: false,
                downRight: false,
                upLeft: false,
                downLeft: false,
            },
            service: { hide: true, fullscreen: true },
        },
    } as const;

    useEffect(() => {
        const handler = async (payload: any) => {
            if (isApplyingPreset.current) {
                return;
            }

            plugin.settings.data.panels.local.preset = '';

            await plugin.settings.saveSettings();
        };

        plugin.settings.eventBus.on(
            `${plugin.settings.events.panels.local.panels.$path}.**`,
            handler
        );

        return () => {
            plugin.settings.eventBus.off(
                `${plugin.settings.events.panels.local.panels.$path}.**`,
                handler
            );
        };
    }, [plugin, isApplyingPreset]);

    const applyPreset = async (preset: keyof typeof presets) => {
        isApplyingPreset.current = true;

        const { zoom, move, service } =
            plugin.settings.data.panels.local.panels;
        const config = presets[preset];

        Object.assign(zoom.buttons, config.zoom);
        Object.assign(move.buttons, config.move);
        Object.assign(service.buttons, config.service);

        await plugin.settings.saveSettings();
        isApplyingPreset.current = false;
    };

    return (
        <>
            <ReactObsidianSetting
                name="Apply preset"
                addDropdowns={[
                    (dropdown) => {
                        dropdown
                            .addOption('', 'Select preset...')
                            .addOption('mobile', 'Mobile Minimal')
                            .addOption('desktop', 'Desktop Full')
                            .addOption('presentation', 'Presentation Mode')
                            .setValue(plugin.settings.data.panels.local.preset)

                            .onChange(async (value) => {
                                if (value) {
                                    plugin.settings.data.panels.local.preset =
                                        value as keyof typeof presets;
                                    await applyPreset(
                                        value as keyof typeof presets
                                    );
                                }
                            });
                        return dropdown;
                    },
                ]}
            />

            <ReactObsidianSetting
                name="Panel layout"
                desc={'Adjust panel positions and visibility'}
                addButtons={[
                    (button) => {
                        button.setIcon('layout');
                        button.setTooltip('Open panel layout editor');
                        button.onClick(() => {
                            setLayoutModalOpen(true);
                        });
                        return button;
                    },
                ]}
            />
            <ReactObsidianSetting
                name="Panel buttons"
                desc={'Configure which buttons appear on each panel'}
                addButtons={[
                    (button) => {
                        button.setIcon('panels-top-left');
                        button.setTooltip('Open panel buttons editor');
                        button.onClick(() => {
                            setButtonModalOpen(true);
                        });
                        return button;
                    },
                ]}
            />
            {layoutModalOpen && (
                <LayoutModal
                    onClose={() => setLayoutModalOpen(false)}
                    title={'Panel layout editor'}
                />
            )}
            {buttonModalOpen && (
                <ButtonManagementModal
                    onClose={() => setButtonModalOpen(false)}
                    title={'Panels buttons'}
                />
            )}
        </>
    );
};

export default Management;
