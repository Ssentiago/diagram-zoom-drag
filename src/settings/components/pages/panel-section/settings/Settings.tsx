import React, { useCallback, useMemo, useState } from 'react';
import { useSettingsContext } from '../../../core/SettingsContext';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { PanelsTriggering } from '../../../../typing/interfaces';
import { DropdownComponent, setTooltip } from 'obsidian';

type PanelVisibilityOption = 'always' | 'hover' | 'focus';

const Settings: React.FC = () => {
    const { plugin } = useSettingsContext();

    const [isIgnoringSettingHidden, setIsIgnoringSettingHidden] = useState(
        plugin.settings.data.panels.global.triggering.mode ===
            PanelsTriggering.ALWAYS
    );

    const [dropdownQuestionTooltip, setDropdownQuestionTooltip] =
        useState<string>('');

    const panelTriggeringOptionsTooltips: Record<
        PanelVisibilityOption,
        string
    > = useMemo(
        () => ({
            always: 'Panels are always visible when this option is selected.',
            hover: 'Panels become visible when hovering the mouse over the diagram. The service panel may remain hidden if the ignore option is enabled.',
            focus: 'Panels become visible when the diagram is focused (e.g., clicked). The service panel may remain hidden if the ignore option is enabled.',
        }),
        [plugin]
    );

    const extractTooltipDependsOnOption = useCallback(
        (dropdown: DropdownComponent) => {
            const selectedValue =
                dropdown.selectEl.options[
                    dropdown.selectEl.options.selectedIndex
                ].value;
            const tooltip =
                panelTriggeringOptionsTooltips[
                    selectedValue as PanelVisibilityOption
                ];
            setDropdownQuestionTooltip(tooltip);
        },
        [plugin]
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
                        extractTooltipDependsOnOption(dropdown);

                        dropdown.onChange(async (value) => {
                            plugin.settings.data.panels.global.triggering.mode =
                                value as PanelsTriggering;
                            setIsIgnoringSettingHidden(
                                value === PanelsTriggering.ALWAYS
                            );
                            extractTooltipDependsOnOption(dropdown);
                            await plugin.settings.saveSettings();
                        });
                        return dropdown;
                    },
                ]}
                addButtons={[
                    (button) => {
                        button.setIcon('message-circle-question');
                        button.setTooltip(dropdownQuestionTooltip);
                        return button;
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
