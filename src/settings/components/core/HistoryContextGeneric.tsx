import React, {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    ReactElement,
    useEffect,
} from 'react';
import { UndoRedoApi, useHistory } from '../hooks/useHistory';
import { useSettingsContext } from './SettingsContext';

interface UndoRedoContextProps<T> extends UndoRedoApi<T> {}

const createHistoryContext = <T extends readonly unknown[]>() => {
    const Context = createContext<UndoRedoContextProps<T> | undefined>(
        undefined
    );

    interface HistoryProviderProps {
        state: T;
        updateState: (state: T) => Promise<void>;
        children: ReactNode;
    }

    const HistoryProvider = ({
        state,
        updateState,
        children,
    }: HistoryProviderProps): ReactElement => {
        const {
            undo,
            canUndo,
            redo,
            canRedo,
            getRedoLabel,
            getUndoLabel,
            updateUndoStack,
        } = useHistory<T>(state, updateState);

        const { plugin } = useSettingsContext();

        const contextValue: UndoRedoContextProps<T> = useMemo(
            () =>
                ({
                    undo,
                    canUndo,
                    redo,
                    canRedo,
                    getRedoLabel,
                    getUndoLabel,
                    updateUndoStack,
                }) as UndoRedoContextProps<T>,
            [
                undo,
                canUndo,
                redo,
                canRedo,
                getRedoLabel,
                getUndoLabel,
                updateUndoStack,
            ]
        );

        useEffect(() => {
            return () => {
                plugin.settings.eventBus.emit('settings-clear-history');
            };
        }, [plugin]);

        return (
            <Context.Provider value={contextValue}>{children}</Context.Provider>
        );
    };

    const useHistoryContext = (): UndoRedoContextProps<T> => {
        const context = useContext(Context);
        if (context === undefined) {
            throw new Error(
                'useUndoRedoContext must be used within a UndoRedoProvider'
            );
        }
        return context;
    };

    return { HistoryProvider, useHistoryContext };
};

export default createHistoryContext;
