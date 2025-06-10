import React from 'react';
import { useSettingsContext } from '../../../../core/SettingsContext';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ToggleComponent } from 'obsidian';

const Folding = (): React.ReactElement => {
    const { plugin } = useSettingsContext();
    return (
        <>
            <ReactObsidianSetting name={'Fold'} setHeading={true} />

            <ReactObsidianSetting
                name="Fold diagrams by default"
                addToggles={[
                    (toggle): ToggleComponent => {
                        toggle
                            .setValue(
                                plugin.settings.data.diagrams.folding
                                    .foldByDefault
                            )
                            .onChange(async (value: boolean) => {
                                plugin.settings.data.diagrams.folding.foldByDefault =
                                    value;
                                await plugin.settings.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />

            <ReactObsidianSetting
                name="Automatically fold diagrams on focus change"
                addToggles={[
                    (toggle): ToggleComponent => {
                        toggle
                            .setValue(
                                plugin.settings.data.diagrams.folding
                                    .autoFoldOnFocusChange
                            )
                            .onChange(async (value: boolean) => {
                                plugin.settings.data.diagrams.folding.autoFoldOnFocusChange =
                                    value;
                                await plugin.settings.saveSettings();
                            });
                        return toggle;
                    },
                ]}
            />
        </>
    );
};

export default Folding;
