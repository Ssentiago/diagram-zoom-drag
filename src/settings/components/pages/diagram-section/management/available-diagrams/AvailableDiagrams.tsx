import React, { useEffect, useMemo, useState } from 'react';
import { useSettingsContext } from '../../../../core/SettingsContext';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useDiagramManagerContext } from '../context/diagramManagerContext';

import { ArrowLeft, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';
import { DiagramItem } from './DiagramItem';
import { useDiagramHistoryContext } from '../context/HistoryContext';
import { DiagramOptionsModal } from './modals/DiagramOptionsModal';
import { usePagination } from './hooks/usePagination';
import {
    ButtonContainer,
    PaginationButton,
    PaginationControls,
    RedoButton,
    UndoButton,
} from './AvailableDiagrams.styled';

export type mode = 'options' | 'edit' | 'none';

export interface ModeState {
    mode: mode;
    index: number;
    data?: {
        [key: string]: any;
    };
}

const AvailableDiagrams: React.FC = () => {
    const { plugin } = useSettingsContext();
    const [diagramsPerPage, setDiagramsPerPage] = useState(
        plugin.settings.data.diagrams.settingsPagination.perPage
    );
    const { diagrams } = useDiagramManagerContext();
    const [modeState, setModeState] = useState<ModeState>({
        mode: 'none',
        index: -1,
    });

    const { navigateToPage, totalPages, pageStartIndex, pageEndIndex, page } =
        usePagination({
            itemsPerPage: diagramsPerPage,
            totalItems: diagrams.length,
        });

    const {
        updateUndoStack,
        undo,
        canUndo,
        canRedo,
        getRedoLabel,
        redo,
        getUndoLabel,
    } = useDiagramHistoryContext();

    useEffect(() => {
        const handler = async () => {
            setDiagramsPerPage(
                plugin.settings.data.diagrams.settingsPagination.perPage
            );
        };

        plugin.settings.eventBus.on(
            plugin.settings.events.diagrams.settingsPagination.perPage.$path,
            handler
        );
        return (): void => {
            plugin.settings.eventBus.off(
                plugin.settings.events.diagrams.settingsPagination.perPage
                    .$path,
                handler
            );
        };
    }, [plugin]);

    const visibleDiagrams = useMemo(() => {
        return diagrams.slice(pageStartIndex, pageEndIndex);
    }, [diagrams, pageStartIndex, pageEndIndex]);

    const getPageChangeButtonLabel = (type: 'previous' | 'next') => {
        const canChange = type === 'next' ? page < totalPages : page > 1;
        const base = canChange ? `Go to ${type} page` : `No ${type} page`;
        const isOccupied = modeState.mode === 'edit';

        if (isOccupied && canChange) {
            return `Can't change page while editing`;
        }

        return base;
    };

    return (
        <>
            <ReactObsidianSetting name="Available diagrams" setHeading />
            <ReactObsidianSetting
                name="Diagrams per page"
                setDisabled={modeState.mode === 'edit'}
                addSliders={[
                    (slider) => {
                        slider.setValue(
                            plugin.settings.data.diagrams.settingsPagination
                                .perPage
                        );
                        slider.setLimits(1, 50, 1);
                        slider.setDynamicTooltip();
                        slider.onChange(async (value) => {
                            plugin.settings.data.diagrams.settingsPagination.perPage =
                                value;
                            await plugin.settings.saveSettings();
                        });
                        return slider;
                    },
                ]}
            />
            <ButtonContainer>
                <UndoButton
                    onClick={undo}
                    disabled={!canUndo}
                    aria-label={getUndoLabel()}
                >
                    <RotateCcw size={'20px'} />
                </UndoButton>

                <PaginationControls>
                    <PaginationButton
                        onClick={() => navigateToPage(-1)}
                        disabled={page === 1 || modeState.mode === 'edit'}
                        aria-label={getPageChangeButtonLabel('previous')}
                    >
                        <ArrowLeft size={'20px'} />
                    </PaginationButton>
                    {`Page ${page} of ${totalPages} (Total diagrams: ${diagrams.length})`}
                    <PaginationButton
                        onClick={() => navigateToPage(1)}
                        disabled={
                            page === totalPages || modeState.mode === 'edit'
                        }
                        aria-label={getPageChangeButtonLabel('next')}
                    >
                        <ArrowRight size={'20px'} />
                    </PaginationButton>
                </PaginationControls>

                <RedoButton
                    disabled={!canRedo}
                    onClick={redo}
                    aria-label={getRedoLabel()}
                >
                    <RotateCw size={'20px'} />
                </RedoButton>
            </ButtonContainer>
            {visibleDiagrams.map((diagram, index) => (
                <DiagramItem
                    key={`${diagram.name}-${diagram.selector}`}
                    diagram={diagram}
                    index={pageStartIndex + index}
                    modeState={modeState}
                    setModeState={setModeState}
                />
            ))}

            {modeState.mode === 'options' && modeState.index !== -1 && (
                <DiagramOptionsModal
                    diagramIndex={modeState.index}
                    onChanges={updateUndoStack}
                    onClose={() => {
                        setModeState({
                            mode: 'none',
                            index: -1,
                        });
                    }}
                />
            )}
        </>
    );
};

export default AvailableDiagrams;
