import {
    MultiDescComponent,
    ReactObsidianSetting,
} from 'react-obsidian-setting';
import {
    ButtonComponent,
    ExtraButtonComponent,
    Platform,
    TextComponent,
} from 'obsidian';
import React, { useRef, useState } from 'react';
import { useSettingsContext } from '../../../../core/SettingsContext';
import UserGuideModal from './modals/UserGuideModal';
import { useDiagramValidation } from '../hooks/useDiagramValidation';
import { useDiagramManagerContext } from '../context/diagramManagerContext';
import { useDiagramHistoryContext } from '../context/HistoryContext';
import styled from 'styled-components';

const AddingDiagramWrapper = styled.div``;

const AddNewDiagram: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [guideOpen, setGuideOpen] = useState(false);
    const {
        validateSelector,
        validateBoth,
        validateName,
        processSelectorValidation,
        processNameValidation,
        processBothValidation,
    } = useDiagramValidation();

    const { diagrams, saveDiagrams } = useDiagramManagerContext();

    const { updateUndoStack } = useDiagramHistoryContext();
    const addingDiagramWrapperRef = useRef<HTMLInputElement>(null);

    const handleAddDiagram = async (): Promise<void> => {
        if (addingDiagramWrapperRef.current === null) {
            return;
        }
        const nameInput = addingDiagramWrapperRef.current.querySelector(
            '#diagram-name'
        ) as HTMLInputElement | null;

        const selectorInput = addingDiagramWrapperRef.current.querySelector(
            '#diagram-selector'
        ) as HTMLInputElement | null;

        if (!nameInput || !selectorInput) {
            return;
        }

        const validationResult = validateBoth(
            nameInput.value,
            selectorInput.value
        );

        const validated = processBothValidation(
            nameInput,
            selectorInput,
            validationResult
        );
        if (!validated) {
            return;
        }

        const oldDiagrams = [...diagrams];

        const newDiagram = {
            name: nameInput.value,
            selector: selectorInput.value,
            on: true,
            panels: {
                move: {
                    on: true,
                },
                zoom: {
                    on: true,
                },
                service: {
                    on: true,
                },
            },
        };

        const newDiagrams = [...diagrams, newDiagram];

        await saveDiagrams(newDiagrams);
        updateUndoStack(
            oldDiagrams,
            `Add diagram\nName: ${newDiagram.name}\nSelector: ${newDiagram.selector}`
        );
        plugin.showNotice('New diagram was added');
        nameInput.value = '';
        selectorInput.value = '';
    };

    const onKeyDown = async (e: React.KeyboardEvent) => {
        if (e.code === 'Enter') {
            if (addingDiagramWrapperRef.current === null) {
                return;
            }

            const isAnyInputsFocused =
                !!addingDiagramWrapperRef.current.querySelector('input:focus');
            if (isAnyInputsFocused) {
                e.preventDefault();
                await handleAddDiagram();
            }
        }
    };

    return (
        <AddingDiagramWrapper
            onKeyDown={onKeyDown}
            ref={addingDiagramWrapperRef}
        >
            <ReactObsidianSetting
                name={'Add new diagram'}
                setHeading
                noBorder
                desc="Here you can configure which diagrams will receive enhanced controls and UI."
                addMultiDesc={(multiDesc: MultiDescComponent) => {
                    multiDesc.addDescriptions([
                        'Adding a Diagram Type:',
                        '1. Enter a unique name using only Latin letters, numbers and `-` (A-Z, a-z, 0-9, -)',
                        '2. Specify a valid CSS selector for your diagram',

                        'Once added, matching diagrams will get:',
                        '• Mouse and keyboard navigation',
                        '• Additional control buttons',

                        'Note: Red border indicates invalid input - hover to see details',
                    ]);
                    return multiDesc;
                }}
            />
            <ReactObsidianSetting
                addTexts={[
                    (name): TextComponent => {
                        name.inputEl.id = 'diagram-name';
                        name.setPlaceholder('Example Diagram');
                        name.onChange((text) => {
                            name.setValue(text);
                            const validationResult = validateName(
                                name.getValue()
                            );
                            processNameValidation(
                                name.inputEl,
                                validationResult
                            );
                        });
                        return name;
                    },
                    (selector): TextComponent => {
                        selector.inputEl.id = 'diagram-selector';
                        selector.setPlaceholder('.example-diagram');
                        selector.onChange((text) => {
                            selector.setValue(text);
                            const validationResult = validateSelector(
                                selector.getValue()
                            );
                            processSelectorValidation(
                                selector.inputEl,
                                validationResult
                            );
                        });
                        return selector;
                    },
                ]}
                addButtons={[
                    (button): ButtonComponent => {
                        button.setIcon('save');
                        button.setTooltip('Add this diagram');
                        button.onClick(async () => {
                            await handleAddDiagram();
                        });
                        return button;
                    },
                ]}
                addExtraButtons={[
                    Platform.isDesktopApp &&
                        ((extra): ExtraButtonComponent => {
                            extra.setIcon('info');
                            extra.setTooltip(
                                'Click for more information on how the plugin works and how you can find diagram selectors'
                            );
                            extra.onClick(() => {
                                setGuideOpen(true);
                            });
                            return extra;
                        }),
                ]}
            />

            {guideOpen && (
                <UserGuideModal onClose={() => setGuideOpen(false)} />
            )}
        </AddingDiagramWrapper>
    );
};

export default AddNewDiagram;
