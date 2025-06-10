import React, { useEffect } from 'react';
import { useDiagramManagerContext } from './context/diagramManagerContext';
import { DiagramHistoryProvider } from './context/HistoryContext';
import AddNewDiagram from './add-new-diagram/AddNewDiagram';
import AvailableDiagrams from './available-diagrams/AvailableDiagrams';
import { useSettingsContext } from '../../../core/SettingsContext';

const Management: React.FC = () => {
    const { diagrams, saveDiagrams } = useDiagramManagerContext();
    const { plugin } = useSettingsContext();

    return (
        <DiagramHistoryProvider state={diagrams} updateState={saveDiagrams}>
            <AddNewDiagram />
            <AvailableDiagrams />
        </DiagramHistoryProvider>
    );
};

export default Management;
