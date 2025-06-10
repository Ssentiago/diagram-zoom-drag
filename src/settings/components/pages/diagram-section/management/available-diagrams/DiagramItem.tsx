import React, { useEffect, useRef } from 'react';

import { DiagramData } from '../../../../../typing/interfaces';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import {
    ButtonComponent,
    ExtraButtonComponent,
    TextComponent,
    ToggleComponent,
} from 'obsidian';

import { useDiagramValidation } from '../hooks/useDiagramValidation';
import styled from 'styled-components';

interface DiagramItemProps {
    diagram: DiagramData;
    index: number;
    editingIndex: number;
    setEditingIndex: (index: number) => void;
    onToggle: (index: number, value: boolean) => Promise<void>;
    onDelete: (index: number) => Promise<void>;
    onSaveEditing: () => Promise<any>;
    setIsDiagramOptionsOpen: (value: boolean) => void;
    setOptionDiagramIndex: (index: number) => void;
}

const EditingItemWrapper = styled.div``;

export const DiagramItem: React.FC<DiagramItemProps> = ({
    diagram,
    index,
    editingIndex,
    setEditingIndex,
    onToggle,
    onDelete,
    onSaveEditing,
    setOptionDiagramIndex,
    setIsDiagramOptionsOpen,
}) => {
    const {
        validateName,
        validateSelector,
        processNameValidation,
        processSelectorValidation,
    } = useDiagramValidation();
    const editingItemRef = useRef<HTMLDivElement>(null);

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            const editingItem = editingItemRef.current;
            if (!editingItem) {
                return;
            }

            const isAnyInputFocused =
                !!editingItem.querySelector('input:focus');
            if (isAnyInputFocused) {
                e.preventDefault();
                await onSaveEditing();
            }
        }
    };

    return editingIndex === index ? (
        <EditingItemWrapper onKeyDown={onKeyDown} ref={editingItemRef}>
            <ReactObsidianSetting
                addTexts={[
                    (nameInput): TextComponent => {
                        nameInput.setValue(diagram.name);
                        nameInput.inputEl.id = 'editing-name-input';
                        nameInput.onChange((value) => {
                            const result = validateName(value, diagram);
                            processNameValidation(nameInput.inputEl, result);
                        });
                        return nameInput;
                    },
                    (selectorInput) => {
                        selectorInput.setValue(diagram.selector);
                        selectorInput.inputEl.id = 'editing-selector-input';
                        selectorInput.onChange((value) => {
                            const validationResult = validateSelector(
                                value,
                                diagram
                            );
                            processSelectorValidation(
                                selectorInput.inputEl,
                                validationResult
                            );
                        });
                        return selectorInput;
                    },
                ]}
                addButtons={[
                    (button): ButtonComponent => {
                        button.setIcon('circle-x');
                        button.setTooltip(
                            'Cancel operation? All changes will be lost.'
                        );
                        button.onClick((cb) => {
                            setEditingIndex(-1);
                        });
                        return button;
                    },
                    (button): ButtonComponent => {
                        button.setIcon('save');
                        button.setTooltip(`Save changes for ${diagram.name}?`);
                        button.onClick(async (cb) => {
                            await onSaveEditing();
                        });
                        return button;
                    },
                ]}
            />
        </EditingItemWrapper>
    ) : (
        <ReactObsidianSetting
            name={diagram.name}
            desc={diagram.selector}
            addToggles={[
                (toggle: ToggleComponent): ToggleComponent => {
                    toggle.setValue(diagram.on);
                    toggle.setTooltip(
                        `${diagram.on ? 'Disable' : 'Enable'} ${diagram.name} diagram`
                    );
                    toggle.onChange(async (value) => onToggle(index, value));
                    return toggle;
                },
            ]}
            addButtons={[
                diagram.name !== 'Default' &&
                    ((button: ButtonComponent): ButtonComponent => {
                        button.setIcon('edit');
                        button.setTooltip(`Edit ${diagram.name} diagram`);
                        button.onClick(async () => {
                            setEditingIndex(index);
                        });
                        return button;
                    }),
                diagram.name !== 'Default' &&
                    ((button: ButtonComponent): ButtonComponent => {
                        button.setIcon('trash');
                        button.setTooltip(`Delete ${diagram.name} diagram`);
                        button.onClick(async () => {
                            await onDelete(index);
                        });
                        return button;
                    }),
            ]}
            addExtraButtons={[
                (button: ExtraButtonComponent): ExtraButtonComponent => {
                    button.setTooltip(`Options for ${diagram.name} diagram`);
                    button.onClick(() => {
                        setOptionDiagramIndex(index);
                        setIsDiagramOptionsOpen(true);
                    });
                    return button;
                },
            ]}
        />
    );
};
