import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ComponentType } from './typing/Size.constants';
import { useSettingsContext } from '../../../../core/SettingsContext';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import DiagramZoomDragPlugin from '../../../../../../core/diagram-zoom-drag-plugin';
import { Notice, setTooltip, TextComponent } from 'obsidian';

interface DimensionsOption {
    type: ComponentType;
}

type DimensionUnit = keyof typeof dimensionSpec;

const dimensionSpec = {
    px: {
        min: 100,
        max: 1000,
        label: 'px',
        rangeMessage: '100-1000px',
    },
    '%': {
        min: 10,
        max: 100,
        label: '%',
        rangeMessage: '10-100%',
    },
};

const getMinMaxByUnit = (unit: DimensionUnit) => ({
    min: dimensionSpec[unit].min.toString(),
    max: dimensionSpec[unit].max.toString(),
});
const getRangeMessage = (unit: DimensionUnit) =>
    dimensionSpec[unit].rangeMessage;
const isDimensionInValidRange = (
    value: string,
    unit: DimensionUnit
): boolean => {
    const n = parseInt(value, 10);
    const { min, max } = dimensionSpec[unit];
    return n >= min && n <= max;
};

function useDiagramSizeSettings(
    plugin: DiagramZoomDragPlugin,
    type: ComponentType
) {
    const settingsSource = useMemo(
        () =>
            type === ComponentType.Expanded
                ? plugin.settings.data.diagrams.size.expanded
                : plugin.settings.data.diagrams.size.folded,
        [plugin.settings.data, type]
    );

    const [height, setHeight] = useState(settingsSource.height);
    const [width, setWidth] = useState(settingsSource.width);

    const prefix = type === ComponentType.Folded ? 'Folded' : 'Expanded';

    return {
        height,
        setHeight,
        width,
        setWidth,
        prefix,
        settingsSource,
    };
}
const getErrorMessage = (field: 'width' | 'height', unit: DimensionUnit) =>
    `Invalid ${field}. Please enter number in range ${getRangeMessage(unit)}.`;

const SizeDimensionsOption: React.FC<DimensionsOption> = ({ type }) => {
    const { plugin } = useSettingsContext();
    const hasValidationErrorsRef = useRef(false);

    const { height, setHeight, width, setWidth, prefix } =
        useDiagramSizeSettings(plugin, type);

    const inputsRef = useRef<HTMLDivElement>(null);

    const validateDimensionInput = useCallback(
        (
            inputEl: HTMLInputElement,
            field: 'width' | 'height',
            unit: DimensionUnit
        ): void => {
            const value = inputEl.value;
            const isValid = isDimensionInValidRange(value, unit);

            if (!isValid) {
                inputEl.addClass('invalid');
                setTooltip(inputEl, getErrorMessage(field, unit));
                hasValidationErrorsRef.current = true;
            } else {
                inputEl.removeClass('invalid');
                setTooltip(inputEl, '');
                hasValidationErrorsRef.current = false;
            }
        },
        []
    );

    const validateAllFields = (
        widthInput: HTMLInputElement,
        heightInput: HTMLInputElement
    ) => {
        const widthValid = isDimensionInValidRange(
            widthInput.value,
            width.unit
        );
        const heightValid = isDimensionInValidRange(
            heightInput.value,
            height.unit
        );
        return widthValid && heightValid;
    };

    useEffect(() => {
        const heightInput = inputsRef.current?.querySelector(
            '#input-height'
        ) as HTMLInputElement | null;
        const widthInput = inputsRef.current?.querySelector(
            '#width-height'
        ) as HTMLInputElement | null;

        if (heightInput?.value) {
            validateDimensionInput(heightInput, 'height', height.unit);
        }
        if (widthInput?.value) {
            validateDimensionInput(widthInput, 'width', width.unit);
        }
    }, [height.unit, width.unit]);

    const handleSave = async () => {
        if (!inputsRef.current) {
            return;
        }

        const widthInput = inputsRef.current.querySelector(
            '#input-width'
        ) as HTMLInputElement;
        const heightInput = inputsRef.current.querySelector(
            '#input-height'
        ) as HTMLInputElement;

        const isValid = validateAllFields(widthInput, heightInput);

        if (!isValid) {
            plugin.showNotice('Please fix validation errors');
            return;
        }

        const inputWidth = parseInt(widthInput.value, 10);
        const inputHeight = parseInt(heightInput.value, 10);

        if (inputWidth === width.value && inputHeight === height.value) {
            plugin.showNotice('Nothing to save');
            return;
        }

        width.value = inputWidth;
        height.value = inputHeight;

        if (type === ComponentType.Folded) {
            plugin.settings.data.diagrams.size.folded.height = height;
            plugin.settings.data.diagrams.size.folded.width = width;
        } else {
            plugin.settings.data.diagrams.size.expanded.height = height;
            plugin.settings.data.diagrams.size.expanded.width = width;
        }

        await plugin.settings.saveSettings();
        plugin.showNotice('Saved successfully');
    };

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            if (!inputsRef.current) {
                return;
            }

            const isAnyFocused =
                !!inputsRef.current.querySelector('input:focus');
            if (isAnyFocused) {
                e.preventDefault();
                await handleSave();
            }
        }
    };

    return (
        <>
            <ReactObsidianSetting
                name={`${prefix} diagram container size`}
                addMultiDesc={(multiDesc) => {
                    multiDesc.addDescriptions([
                        `Set the container dimensions for ${prefix.toLowerCase()} state.`,
                        `px: 100-1000, %: 10-100`,
                        'Click Save button or press Enter to apply changes.',
                    ]);
                    return multiDesc;
                }}
                noBorder={true}
            />

            <div onKeyDown={onKeyDown} ref={inputsRef}>
                <ReactObsidianSetting
                    addTexts={[
                        (inputHeight): TextComponent => {
                            const parent = inputHeight.inputEl
                                .parentElement as HTMLElement;
                            inputHeight.inputEl.id = 'input-height';
                            const label = document.createElement('label');
                            label.textContent = 'Height:';
                            parent.insertBefore(label, inputHeight.inputEl);
                            inputHeight.setValue(height.value.toString());
                            inputHeight.setPlaceholder('height');
                            inputHeight.onChange((value) => {
                                inputHeight.setValue(value.replace(/\D/, ''));

                                validateDimensionInput(
                                    inputHeight.inputEl,
                                    'height',
                                    height.unit
                                );
                            });
                            return inputHeight;
                        },
                        (inputWidth): TextComponent => {
                            const wrapper = inputWidth.inputEl
                                .parentElement as HTMLElement;
                            inputWidth.inputEl.id = 'input-width';
                            const label = document.createElement('label');
                            label.textContent = 'Width:';
                            wrapper.insertBefore(label, inputWidth.inputEl);

                            inputWidth.setValue(width.value.toString());
                            inputWidth.setPlaceholder('width');
                            inputWidth.onChange((value) => {
                                inputWidth.setValue(value.replace(/\D/, ''));

                                validateDimensionInput(
                                    inputWidth.inputEl,
                                    'width',
                                    width.unit
                                );
                            });
                            return inputWidth;
                        },
                    ]}
                    addDropdowns={[
                        (dropdown) => {
                            dropdown.addOptions({ px: 'px', '%': '%' });
                            dropdown.setValue(height.unit);
                            dropdown.onChange((value) => {
                                setHeight({
                                    ...height,
                                    unit: value as DimensionUnit,
                                });
                            });
                            return dropdown;
                        },
                        (dropdown) => {
                            dropdown.addOptions({ px: 'px', '%': '%' });
                            dropdown.setValue(width.unit);
                            dropdown.onChange((value) => {
                                const newUnit = value as DimensionUnit;
                                setHeight({ ...height, unit: newUnit });
                            });
                            return dropdown;
                        },
                    ]}
                    addButtons={[
                        (button) => {
                            button.setIcon('save');
                            button.onClick(handleSave);
                            return button;
                        },
                    ]}
                />
            </div>
        </>
    );
};

export default SizeDimensionsOption;
