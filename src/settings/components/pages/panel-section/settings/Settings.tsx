import React, { useState } from 'react';
import { useSettingsContext } from '../../../core/SettingsContext';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { PanelsTriggering } from '../../../../typing/interfaces';

const Settings: React.FC = () => {
    const { plugin } = useSettingsContext();

    const [isIgnoringSettingHidden, setIsIgnoringSettingHidden] = useState(
        plugin.settings.data.panels.global.triggering.mode ===
            PanelsTriggering.ALWAYS
    );

    return (
        <>
            <ReactObsidianSetting name="Panels behavior" setHeading={true} />

            <ReactObsidianSetting
                name={'Panels visibility'}
                desc={'Control when panels will be visible'}
                addDropdowns={[
                    (dropdown) => {
                        dropdown.addOptions({
                            always: 'Always',
                            hover: 'On hover',
                            focus: 'On focus',
                        });
                        dropdown.setValue(
                            plugin.settings.data.panels.global.triggering.mode
                        );
                        dropdown.onChange(async (value) => {
                            plugin.settings.data.panels.global.triggering.mode =
                                value as PanelsTriggering;
                            setIsIgnoringSettingHidden(
                                value === PanelsTriggering.ALWAYS
                            );
                            await plugin.settings.saveSettings();
                        });
                        return dropdown;
                    },
                ]}
            />

            {!isIgnoringSettingHidden && (
                <ReactObsidianSetting
                    name={'Ignore panel visibility rule for service panel'}
                    desc={
                        'Service panel will always be visible regardless of visibility mode'
                    }
                    addToggles={[
                        (toggle) => {
                            toggle.setValue(
                                plugin.settings.data.panels.global.triggering
                                    .ignoreService
                            );
                            toggle.onChange(async (value) => {
                                plugin.settings.data.panels.global.triggering.ignoreService =
                                    value;
                                await plugin.settings.saveSettings();
                            });
                            return toggle;
                        },
                    ]}
                />
            )}
        </>
    );
};

export default Settings;
