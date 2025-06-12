import React from 'react';

import {
    ReactObsidianModal,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import { useSettingsContext } from '../../../../core/SettingsContext';

interface ButtonManagementModalProps {
    onClose: () => void;
    title: string;
}

const UI_PRIORITY = {
    TOGGLE: 1,
    BUTTON: 2,
} as const;

const ButtonManagementModal: React.FC<ButtonManagementModalProps> = ({
    onClose,
    title,
}) => {
    const { plugin } = useSettingsContext();

    const buttonData = React.useMemo(() => {
        const { zoom, move, service } =
            plugin.settings.data.panels.local.panels;
        return {
            zoom: [
                {
                    tooltip: 'Zoom In',
                    icon: 'zoom-in',
                    getValue: () => zoom.buttons.in,
                    setValue: (v: boolean) => (zoom.buttons.in = v),
                },
                {
                    tooltip: 'Zoom Out',
                    icon: 'zoom-out',
                    getValue: () => zoom.buttons.out,
                    setValue: (v: boolean) => (zoom.buttons.out = v),
                },
                {
                    tooltip: 'Reset',
                    icon: 'refresh-cw',
                    getValue: () => zoom.buttons.reset,
                    setValue: (v: boolean) => (zoom.buttons.reset = v),
                },
            ],
            move: [
                {
                    tooltip: 'Move Up',
                    icon: 'arrow-up',
                    getValue: () => move.buttons.up,
                    setValue: (v: boolean) => (move.buttons.up = v),
                },
                {
                    tooltip: 'Move Down',
                    icon: 'arrow-down',
                    getValue: () => move.buttons.down,
                    setValue: (v: boolean) => (move.buttons.down = v),
                },
                {
                    tooltip: 'Move Left',
                    icon: 'arrow-left',
                    getValue: () => move.buttons.left,
                    setValue: (v: boolean) => (move.buttons.left = v),
                },
                {
                    tooltip: 'Move Right',
                    icon: 'arrow-right',
                    getValue: () => move.buttons.right,
                    setValue: (v: boolean) => (move.buttons.right = v),
                },
                {
                    tooltip: 'Move Right Up',
                    icon: 'arrow-up-right',
                    getValue: () => move.buttons.upRight,
                    setValue: (v: boolean) => (move.buttons.upRight = v),
                },
                {
                    tooltip: 'Move Right Down',
                    icon: 'arrow-down-right',
                    getValue: () => move.buttons.downRight,
                    setValue: (v: boolean) => (move.buttons.downRight = v),
                },
                {
                    tooltip: 'Move Left Up',
                    icon: 'arrow-up-left',
                    getValue: () => move.buttons.upLeft,
                    setValue: (v: boolean) => (move.buttons.upLeft = v),
                },
                {
                    tooltip: 'Move Left Down',
                    icon: 'arrow-down-left',
                    getValue: () => move.buttons.downLeft,
                    setValue: (v: boolean) => (move.buttons.downLeft = v),
                },
            ],
            service: [
                {
                    tooltip: 'Hide',
                    icon: 'eye',
                    getValue: () => service.buttons.hide,
                    setValue: (v: boolean) => (service.buttons.hide = v),
                },
                {
                    tooltip: 'Fullscreen',
                    icon: 'fullscreen',
                    getValue: () => service.buttons.fullscreen,
                    setValue: (v: boolean) => (service.buttons.fullscreen = v),
                },
            ],
        };
    }, [plugin]);

    return (
        <ReactObsidianModal title={title} onClose={onClose}>
            <ReactObsidianSetting name={'Panel buttons section'} setHeading />
            {Object.entries(buttonData).map(([panel, panelData]) => (
                <React.Fragment key={panel}>
                    <ReactObsidianSetting
                        name={panel
                            .charAt(0)
                            .toUpperCase()
                            .concat(panel.slice(1).toLowerCase())}
                        setHeading
                    />
                    {panelData.map(
                        ({ tooltip, icon, getValue, setValue }, index) => (
                            <ReactObsidianSetting
                                key={tooltip}
                                name={tooltip}
                                noBorder={index !== panelData.length - 1}
                                addButtons={[
                                    {
                                        priority: UI_PRIORITY.BUTTON,
                                        callback: (button) => {
                                            button.setIcon(icon);
                                            button.setTooltip(tooltip);
                                            return button;
                                        },
                                    },
                                ]}
                                addToggles={[
                                    {
                                        priority: UI_PRIORITY.TOGGLE,
                                        callback: (toggle) => {
                                            toggle
                                                .setValue(getValue())
                                                .onChange(
                                                    async (value: boolean) => {
                                                        setValue(value);
                                                        await plugin.settings.saveSettings();
                                                    }
                                                );
                                            return toggle;
                                        },
                                    },
                                ]}
                            />
                        )
                    )}
                </React.Fragment>
            ))}
        </ReactObsidianModal>
    );
};

export default ButtonManagementModal;
