import { DiagramData } from '../../../../../../typing/interfaces';
import { useSettingsContext } from '../../../../../core/SettingsContext';
import { createSettingsProxy } from '../../../../../../settings-manager';

import { useDiagramValidation } from '../../hooks/useDiagramValidation';
import { useDiagramManagerContext } from '../../context/diagramManagerContext';
import { useDiagramHistoryContext } from '../../context/HistoryContext';

export const useDiagramOperations = () => {
    const { plugin } = useSettingsContext();
    const { validateBoth, processBothValidation } = useDiagramValidation();
    const { diagrams, saveDiagrams } = useDiagramManagerContext();
    const { updateUndoStack } = useDiagramHistoryContext();

    const handleDelete = async (index: number) => {
        const oldDiagrams = [...diagrams];
        const newDiagrams = [...diagrams];
        const deleted = newDiagrams[index];
        newDiagrams.splice(index, 1);

        await saveDiagrams(newDiagrams);
        updateUndoStack(
            oldDiagrams,
            `Delete diagram\n\`Name: ${deleted.name}\nSelector: ${deleted.selector}\``
        );
    };

    const handleToggle = async (index: number, value: boolean) => {
        const oldDiagrams = createSettingsProxy(
            plugin,
            JSON.parse(JSON.stringify(diagrams)),
            ['supported_diagrams']
        );
        diagrams[index].on = value;
        await saveDiagrams([...diagrams]);
        updateUndoStack(
            oldDiagrams,
            `${value ? 'Enable' : 'Disable'} ${diagrams[index].name} diagram`
        );
    };

    const handleSaveEditing = async (index: number) => {
        const oldDiagram = diagrams[index];

        const editingNameInput: HTMLInputElement | null =
            document.querySelector('#editing-name-input');
        const editingSelectorInput: HTMLInputElement | null =
            document.querySelector('#editing-selector-input');
        if (!editingNameInput || !editingSelectorInput) {
            return;
        }

        const validationResult = validateBoth(
            editingNameInput.value,
            editingSelectorInput.value,
            oldDiagram
        );
        const validated = processBothValidation(
            editingNameInput,
            editingSelectorInput,
            validationResult
        );

        if (validated) {
            const oldName = oldDiagram.name;
            const oldSelector = oldDiagram.selector;
            const nameChanged = oldName !== editingNameInput.value;
            const selectorChanged = oldSelector !== editingSelectorInput.value;
            diagrams[index].name = editingNameInput.value;
            diagrams[index].selector = editingSelectorInput.value;
            await saveDiagrams([...diagrams]);
            editingNameInput.removeAttribute('id');
            editingSelectorInput.removeAttribute('id');

            const changes = [];
            if (nameChanged) {
                changes.push(`name: "${oldName}" → "${diagrams[index].name}"`);
            }
            if (selectorChanged) {
                changes.push(
                    `selector: "${oldSelector}" → "${diagrams[index].selector}"`
                );
            }

            updateUndoStack(
                diagrams,
                `Edit diagram "${diagrams[index].name}":\n${changes.join('\n')}`
            );
        }
        return validated;
    };

    return {
        handleDelete,
        handleToggle,
        handleSaveEditing,
    };
};
