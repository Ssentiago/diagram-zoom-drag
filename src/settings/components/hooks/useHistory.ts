import { DiagramData } from '../../typing/interfaces';
import { useSettingsContext } from '../core/SettingsContext';
import { useEffect, useState } from 'react';

interface HistoryAction<T> {
    state: T;
    description: string;
}

export interface UndoRedoApi<T> {
    updateUndoStack: (state: T, description: string) => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    canUndo: boolean;
    canRedo: boolean;
    getRedoLabel: () => string;
    getUndoLabel: () => string;
}

export const useHistory = <T extends readonly unknown[]>(
    state: T,
    updateState: (state: T) => Promise<void>
): UndoRedoApi<T> => {
    const { plugin } = useSettingsContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [undoStack, setUndoStack] = useState<HistoryAction<T>[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryAction<T>[]>([]);
    const [undoDescription, setUndoDescription] = useState('');
    const [redoDescription, setRedoDescription] = useState('');

    useEffect(() => {
        (window as any).undoDebug = {
            undoStack,
            redoStack,
            undoDescription,
            redoDescription,
            canUndo: undoStack.length > 0,
            canRedo: redoStack.length > 0,
            currentState: state,
        };
    }, [undoStack, redoStack, undoDescription, redoDescription, state]);

    useEffect(() => {}, [redoStack]);

    useEffect(() => {
        if (undoStack.length > 0) {
            const action = undoStack[undoStack.length - 1];
            setUndoDescription(action.description);
        } else {
            setUndoDescription('');
        }
        if (redoStack.length > 0) {
            const action = redoStack[redoStack.length - 1];
            setRedoDescription(action.description);
        } else {
            setRedoDescription('');
        }
    }, [undoStack, redoStack]);

    const getUndoLabel = () => {
        if (!undoDescription) {
            return 'Nothing to undo\nShortcut: CTR+Z';
        }
        const count =
            undoStack.length > 1 ? ` (${undoStack.length - 1} more)` : '';
        return `Undo\n${undoDescription}${count}\nShortcut: CTR+Z`;
    };

    const getRedoLabel = () => {
        if (!redoDescription) {
            return 'Nothing to redo\nShortcut: CTR+SHIFT+Z';
        }
        const count =
            redoStack.length > 1 ? ` (${redoStack.length - 1} more)` : '';
        return `Redo\n${redoDescription}${count}\nShortcut: CTR+SHIFT+Z`;
    };

    useEffect(() => {
        const handler = async () => {
            setUndoStack([]);
            setRedoStack([]);
            setCanUndo(false);
            setCanRedo(false);
        };
        plugin.settings.eventBus.on('settings-reset', handler);
        plugin.settings.eventBus.on('settings-clear-history', handler);

        return () => {
            plugin.settings.eventBus.off('settings-reset', handler);
            plugin.settings.eventBus.off('settings-clear-history', handler);
        };
    }, []);

    const updateUndoStack = (state: T, description: string) => {
        let newUndoStack: HistoryAction<T>[] = [...undoStack];
        newUndoStack.push({
            description: description,
            state: state,
        });
        setCanUndo(true);
        if (newUndoStack.length > 50) {
            newUndoStack = [...newUndoStack.slice(-49)];
        }

        setUndoStack(newUndoStack);
        setRedoStack([]);
        setCanRedo(false);
    };
    const updateRedoStack = (action: HistoryAction<T>) => {
        const newRedoStack = [...redoStack, action];
        setRedoStack(newRedoStack);
        setCanRedo(true);
    };

    const undo = async () => {
        if (undoStack.length > 0) {
            const previousState = undoStack[undoStack.length - 1];
            // Сохраняем ТЕКУЩЕЕ состояние в redo стек
            updateRedoStack({
                state: [...state] as unknown as T, // текущее состояние
                description: previousState.description, // меняем местами описания
            });

            // Восстанавливаем предыдущее состояние
            await updateState([...previousState.state] as unknown as T);

            const newUndoStack = undoStack.slice(0, -1);
            setUndoStack(newUndoStack);
            setCanUndo(newUndoStack.length > 0);
        }
    };

    const redo = async () => {
        if (redoStack.length > 0) {
            const redoAction = redoStack[redoStack.length - 1];

            // Добавляем текущее состояние обратно в undo стек
            const newUndoStack = [
                ...undoStack,
                {
                    state: [...state] as unknown as T, // текущее состояние
                    description: redoAction.description,
                } as HistoryAction<T>,
            ];
            setUndoStack(newUndoStack);

            // Убираем последний элемент из redo стека
            const newRedoStack = redoStack.slice(0, -1);
            setRedoStack(newRedoStack);

            // Применяем redo состояние
            await updateState([...redoAction.state] as unknown as T);

            setCanUndo(true);
            setCanRedo(newRedoStack.length > 0);
        }
    };

    useEffect(() => {
        const handler = async (e: KeyboardEvent) => {
            if (e.code !== 'KeyZ' && e.code !== 'KeyY') {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                if (canRedo) {
                    await redo();
                } else {
                    plugin.showNotice('Nothing to redo');
                }
            } else if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (canUndo) {
                    await undo();
                } else {
                    plugin.showNotice('Nothing to undo');
                }
            }

            if (e.code === 'KeyY' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                e.preventDefault();
                await redo();
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => {
            window.removeEventListener('keydown', handler, true);
        };
    }, [undo, redo]);
    return {
        updateUndoStack,
        undo,
        redo,
        canUndo,
        canRedo,
        getRedoLabel,
        getUndoLabel,
    };
};
