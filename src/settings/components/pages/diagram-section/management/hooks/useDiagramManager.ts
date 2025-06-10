import { useSettingsContext } from '../../../../core/SettingsContext';
import { useCallback, useEffect, useState } from 'react';
import { DiagramData } from '../../../../../typing/interfaces';

export const useDiagramsManager = () => {
    const { plugin } = useSettingsContext();
    const [diagrams, setDiagrams] = useState(
        plugin.settings.data.diagrams.supported_diagrams
    );

    useEffect(() => {
        const handler = () => {
            setDiagrams(plugin.settings.data.diagrams.supported_diagrams);
        };

        plugin.settings.eventBus.on(
            plugin.settings.events.diagrams.supported_diagrams.$path,
            handler
        );
        return () => {
            plugin.settings.eventBus.off(
                plugin.settings.events.diagrams.supported_diagrams.$path,
                handler
            );
        };
    }, [plugin]);

    const saveDiagrams = useCallback(
        async (newDiagrams: DiagramData[]) => {
            setDiagrams(newDiagrams);
            plugin.settings.data.diagrams.supported_diagrams = newDiagrams;
            await plugin.settings.saveSettings();
        },
        [plugin]
    );

    return { diagrams, saveDiagrams };
};
