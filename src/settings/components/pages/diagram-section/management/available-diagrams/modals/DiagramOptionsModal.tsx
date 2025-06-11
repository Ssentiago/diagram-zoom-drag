import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import { useSettingsContext } from '../../../../../core/SettingsContext';
import React, { useMemo } from 'react';
import { DiagramData } from '../../../../../../typing/interfaces';
import { createSettingsProxy } from '../../../../../../settings-manager';
import { useDiagramManagerContext } from '../../context/diagramManagerContext';
import { startCase } from 'lodash';

interface DiagramOptionsProps {
    diagramIndex: number;
    onClose: () => void;
    onChanges: (state: DiagramData[], description: string) => void;
}

export const DiagramOptionsModal: React.FC<DiagramOptionsProps> = ({
    diagramIndex,
    onClose,
    onChanges,
}) => {
    const { plugin } = useSettingsContext();
    const { diagrams } = useDiagramManagerContext();
    const diagram = useMemo(() => diagrams[diagramIndex], [diagramIndex]);

    return (
        <ReactObsidianModal
            onClose={onClose}
            title={`${diagram.name}\ diagram options`}
        >
            <ReactObsidianSetting
                desc={'These settings will only apply to this diagram.'}
            />

            <ReactObsidianSetting name={'Panels'} setHeading={true} />

            {Object.entries(diagram.panels).map(([panel, { on }]) => (
                <ReactObsidianSetting
                    name={panel.charAt(0).concat(panel.slice(1).toLowerCase())}
                    key={panel}
                    addToggles={[
                        (toggle) => {
                            toggle.setValue(on);
                            toggle.onChange(async (value) => {
                                const oldDiagrams = createSettingsProxy(
                                    plugin,
                                    JSON.parse(JSON.stringify(diagrams)),
                                    ['supported_diagrams']
                                );
                                plugin.settings.data.diagrams.supported_diagrams[
                                    diagramIndex
                                ].panels[panel].on = value;
                                await plugin.settings.saveSettings();

                                onChanges(
                                    oldDiagrams,
                                    `Turn ${!value ? 'off' : 'on'} panel \`${panel}\` for diagram \`${diagram.name}\``
                                );
                            });

                            return toggle;
                        },
                    ]}
                />
            ))}
        </ReactObsidianModal>
    );
};
