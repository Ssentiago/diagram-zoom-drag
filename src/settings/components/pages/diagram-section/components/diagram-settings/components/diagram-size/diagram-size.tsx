import { ReactObsidianSetting } from 'react-obsidian-setting';
import React, { useState } from 'react';
import { useSettingsContext } from '../../../../../../core/context';
import { ComponentType } from './typing/constanst';

import type { ButtonComponent, TextComponent } from 'obsidian';

/**
 * A React component that renders two settings for the diagram size:
 * one for the expanded diagram and one for the collapsed diagram.
 *
 * It uses the `ReactObsidianSetting` component to render a setting with a
 * heading and two input fields for the width and height of the diagram.
 *
 * The component also handles the saving of the new values to the plugin
 * settings and updates the CSS properties.
 *
 * @returns The React component for the diagram size settings.
 */
const DiagramSizes: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [expandedHeight, setExpandedHeight] = useState(
        plugin.settings.diagramExpandedHeight
    );
    const [expandedWidth, setExpandedWidth] = useState(
        plugin.settings.diagramExpandedWidth
    );
    const [collapsedHeight, setCollapsedHeight] = useState(
        plugin.settings.diagramCollapsedHeight
    );
    const [collapsedWidth, setCollapsedWidth] = useState(
        plugin.settings.diagramCollapsedWidth
    );

    const isDimensionInValidRange = (value: number, unit: string): boolean => {
        if (unit === 'px') return value >= 100 && value <= 1000;
        if (unit === '%') return value >= 10 && value <= 100;
        return false;
    };

    const createLabeledInputWithUnit = (
        labelText: string,
        id: string,
        setting: { value: number; unit: 'px' | '%' },
        onValueChange: (newValue: number) => void,
        onUnitChange: (newUnit: 'px' | '%') => void
    ): HTMLDivElement => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '4px';

        const label = document.createElement('label');
        label.textContent = labelText;
        container.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.value = setting.value.toString();
        input.min = setting.unit === 'px' ? '100' : '10';
        input.max = setting.unit === 'px' ? '1000' : '100';
        input.onchange = () => onValueChange(parseInt(input.value, 10));
        container.appendChild(input);

        const select = document.createElement('select');
        ['px', '%'].forEach((unit) => {
            const option = document.createElement('option');
            option.value = unit;
            option.text = unit;
            if (unit === setting.unit) option.selected = true;
            select.appendChild(option);
        });
        select.onchange = () => onUnitChange(select.value as 'px' | '%');
        container.appendChild(select);

        return container;
    };

    const createSettingInputs = (componentType: ComponentType): JSX.Element => {
        const prefix =
            componentType === ComponentType.Collapsed
                ? 'Collapsed'
                : 'Expanded';

        const widthSetting =
            componentType === ComponentType.Collapsed
                ? collapsedWidth
                : expandedWidth;
        const heightSetting =
            componentType === ComponentType.Collapsed
                ? collapsedHeight
                : expandedHeight;

        const setWidth =
            componentType === ComponentType.Collapsed
                ? setCollapsedWidth
                : setExpandedWidth;
        const setHeight =
            componentType === ComponentType.Collapsed
                ? setCollapsedHeight
                : setExpandedHeight;

        return (
            <>
                <ReactObsidianSetting
                    name={`${prefix} diagram container size`}
                    addMultiDesc={(multiDesc) => {
                        multiDesc.addDescriptions([
                            `Set the container dimensions for ${prefix.toLowerCase()} state in size.`,
                            'Values must match unit constraints (px: 100-1000, %: 10-100).',
                            'Click Save button to apply changes.',
                        ]);
                        return multiDesc;
                    }}
                    setHeading={true}
                    noBorder={true}
                />

                <ReactObsidianSetting
                    addTexts={[
                        (component): TextComponent => {
                            const parent = component.inputEl.parentElement!;
                            parent.innerHTML = '';

                            const row = document.createElement('div');
                            row.style.display = 'flex';
                            row.style.gap = '12px';

                            row.appendChild(
                                createLabeledInputWithUnit(
                                    'Width:',
                                    `input${prefix}Width`,
                                    widthSetting,
                                    (value) =>
                                        setWidth({ ...widthSetting, value }),
                                    (unit) =>
                                        setWidth({ ...widthSetting, unit })
                                )
                            );

                            row.appendChild(
                                createLabeledInputWithUnit(
                                    'Height:',
                                    `input${prefix}Height`,
                                    heightSetting,
                                    (value) =>
                                        setHeight({ ...heightSetting, value }),
                                    (unit) =>
                                        setHeight({ ...heightSetting, unit })
                                )
                            );

                            parent.appendChild(row);
                            return component;
                        },
                    ]}
                    addButtons={[
                        (button): ButtonComponent => {
                            button.setIcon('save');
                            button.onClick(async () => {
                                const widthEl =
                                    document.querySelector<HTMLInputElement>(
                                        `#input${prefix}Width`
                                    );
                                const heightEl =
                                    document.querySelector<HTMLInputElement>(
                                        `#input${prefix}Height`
                                    );

                                if (!widthEl || !heightEl) return;

                                const width = parseInt(widthEl.value, 10);
                                const height = parseInt(heightEl.value, 10);
                                const widthUnit = widthSetting.unit;
                                const heightUnit = heightSetting.unit;

                                if (isNaN(width) || isNaN(height)) {
                                    plugin.showNotice(
                                        'Please enter valid numbers'
                                    );
                                    return;
                                }

                                if (
                                    !isDimensionInValidRange(width, widthUnit)
                                ) {
                                    plugin.showNotice(
                                        `Invalid width. ${widthUnit === 'px' ? '100–1000px' : '10–100%'} allowed.`
                                    );
                                    return;
                                }

                                if (
                                    !isDimensionInValidRange(height, heightUnit)
                                ) {
                                    plugin.showNotice(
                                        `Invalid height. ${heightUnit === 'px' ? '100–1000px' : '10–100%'} allowed.`
                                    );
                                    return;
                                }

                                const widthSettingNew = {
                                    value: width,
                                    unit: widthUnit,
                                };
                                const heightSettingNew = {
                                    value: height,
                                    unit: heightUnit,
                                };

                                if (componentType === ComponentType.Collapsed) {
                                    setCollapsedWidth(widthSettingNew);
                                    setCollapsedHeight(heightSettingNew);
                                    plugin.settings.diagramCollapsedWidth =
                                        widthSettingNew;
                                    plugin.settings.diagramCollapsedHeight =
                                        heightSettingNew;
                                } else {
                                    setExpandedWidth(widthSettingNew);
                                    setExpandedHeight(heightSettingNew);
                                    plugin.settings.diagramExpandedWidth =
                                        widthSettingNew;
                                    plugin.settings.diagramExpandedHeight =
                                        heightSettingNew;
                                }

                                await plugin.settingsManager.saveSettings();
                                plugin.updateCssProperties();
                                plugin.showNotice('Saved successfully');
                            });
                            return button;
                        },
                    ]}
                    noBorder={true}
                />
            </>
        );
    };

    return (
        <>
            {createSettingInputs(ComponentType.Expanded)}
            {createSettingInputs(ComponentType.Collapsed)}
        </>
    );
};

export default DiagramSizes;
