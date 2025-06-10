import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { DiagramData } from '../../../../../typing/interfaces';
import { useDiagramsManager } from '../hooks/useDiagramManager'; // импортируем хук

interface DiagramManagerContextProps {
    diagrams: DiagramData[];
    saveDiagrams: (newDiagrams: DiagramData[]) => Promise<void>;
}

const DiagramManagerContext = createContext<
    DiagramManagerContextProps | undefined
>(undefined);

interface DiagramManagerProviderProps {
    children: ReactNode;
}

export const DiagramManagerProvider = ({
    children,
}: DiagramManagerProviderProps) => {
    const { diagrams, saveDiagrams } = useDiagramsManager();

    const contextValue = useMemo(
        () => ({
            diagrams,
            saveDiagrams,
        }),
        [diagrams, saveDiagrams]
    );

    return (
        <DiagramManagerContext.Provider value={contextValue}>
            {children}
        </DiagramManagerContext.Provider>
    );
};

export const useDiagramManagerContext = (): DiagramManagerContextProps => {
    const context = useContext(DiagramManagerContext);
    if (context === undefined) {
        throw new Error(
            'useDiagramManagerContext must be used within a DiagramManagerProvider'
        );
    }
    return context;
};
