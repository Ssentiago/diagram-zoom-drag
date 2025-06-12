import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../../../../core/SettingsContext';
import {
    DiagramPreview,
    DiagramSetup,
    FoldPanel,
    PanelControl,
    PanelPreview,
    PanelToggle,
} from './PanelLayout.styled';
import { Panels, PanelsConfig } from '../../../../../typing/interfaces';
import useDragDrop from './hooks/useDragDrop';

const PanelLayout: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [panels, setPanels] = useState(
        plugin.settings.data.panels.local.panels
    );

    const [updateTrigger, setUpdateTrigger] = useState(false);
    const diagramPreviewRef = React.useRef<HTMLDivElement>(null);

    const { draggedPanel, props } = useDragDrop({
        diagramPreviewRef,
        panels,
    });

    useEffect(() => {
        const handler = (p: any) => {
            console.log(p);
            setUpdateTrigger((prev) => !prev);
        };

        plugin.settings.eventBus.on(
            plugin.settings.events.panels.local.panels.$all,
            handler
        );

        return () => {
            plugin.settings.eventBus.off(
                plugin.settings.events.panels.local.panels.$all,
                handler
            );
        };
    }, []);

    const togglePanelState = async (
        panelName: keyof Panels['local']['panels']
    ): Promise<void> => {
        panels[panelName].on = !panels[panelName].on;
        await plugin.settings.saveSettings();
    };

    return (
        <DiagramSetup>
            <DiagramPreview
                ref={diagramPreviewRef}
                onDragOver={(e) => e.preventDefault()}
                {...props.container}
            >
                {Object.entries(panels).map(
                    ([name, config]) =>
                        config.on && (
                            <PanelPreview
                                key={name}
                                dragging={draggedPanel === name}
                                {...props.panel(name)}
                                style={{
                                    ...config.position,
                                }}
                            >
                                {name}
                            </PanelPreview>
                        )
                )}
                <FoldPanel>fold</FoldPanel>
            </DiagramPreview>
            <PanelControl>
                {Object.entries(panels).map(([name, config]) => (
                    <PanelToggle key={name}>
                        <input
                            type="checkbox"
                            checked={config.on}
                            onChange={() =>
                                togglePanelState(name as keyof PanelsConfig)
                            }
                        />
                        {name}
                    </PanelToggle>
                ))}
            </PanelControl>
        </DiagramSetup>
    );
};

export default PanelLayout;
