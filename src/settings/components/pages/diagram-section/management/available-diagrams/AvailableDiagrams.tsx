import React, { useEffect, useMemo, useState } from 'react';
import { useSettingsContext } from '../../../../core/SettingsContext';
import {
    ButtonContainer,
    DiagramContainer,
    PaginationButton,
    PaginationControls,
    RedoButton,
    UndoButton,
} from './AvailableDiagrams.styled';
import { SwitchPageConfirmModal } from './modals/SwitchPageConfirmModal';
import { DiagramOptionsModal } from './modals/DiagramOptionsModal';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';
import { usePagination } from './hooks/usePagination';
import { useDiagramOperations } from './hooks/useDiagramOperations';
import { DiagramItem } from './DiagramItem';
import { useDiagramHistoryContext } from '../context/HistoryContext';
import { useDiagramManagerContext } from '../context/diagramManagerContext';
import { AnimationState } from './typing/interfaces';

const AvailableDiagrams: React.FC = () => {
    const { plugin } = useSettingsContext();

    const [editingIndex, setEditingIndex] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [diagramsPerPage, setDiagramsPerPage] = useState(
        plugin.settings.data.diagrams.settingsPagination.perPage
    );

    const { diagrams, saveDiagrams } = useDiagramManagerContext();

    const [pendingDiagrams, setPendingDiagrams] = useState(diagrams);
    const [pendingItemsPerPage, setPendingItemsPerPage] =
        useState(diagramsPerPage);

    const [isDiagramOptionsOpen, setIsDiagramOptionsOpen] = useState(false);
    const [optionDiagramIndex, setOptionDiagramIndex] = useState(-1);

    const [animationState, setAnimationState] = useState<AnimationState>({
        type: 'none',
        isTransition: false,
    });

    const {
        updateUndoStack,
        undo,
        canUndo,
        redo,
        canRedo,
        getRedoLabel,
        getUndoLabel,
    } = useDiagramHistoryContext();

    const {
        navigateToPage,
        totalPages,
        changePage,
        actualIndex,
        delta,
        isSwitchConfirmOpen,
        setIsSwitchConfirmOpen,
    } = usePagination({
        itemsPerPage: pendingItemsPerPage,
        totalItems: pendingDiagrams.length,
        currentPage,
        setCurrentPage,
        editingIndex,
        animationState,
        setAnimationState,
    });

    const { handleToggle, handleDelete, handleSaveEditing } =
        useDiagramOperations(
            diagrams,
            saveDiagrams,
            updateUndoStack,
            actualIndex,
            editingIndex,
            setEditingIndex
        );

    useEffect(() => {
        const handler = async () => {
            const newDiagramsPerPage =
                plugin.settings.data.diagrams.settingsPagination.perPage;
            const oldTotalPages = Math.max(
                1,
                Math.ceil(pendingDiagrams.length / diagramsPerPage)
            );
            const newTotalPages = Math.max(
                1,
                Math.ceil(pendingDiagrams.length / newDiagramsPerPage)
            );

            const shouldAnimate =
                oldTotalPages !== newTotalPages || currentPage > newTotalPages;

            if (shouldAnimate) {
                setAnimationState({ ...animationState, type: 'layout-change' });
            }

            setDiagramsPerPage(newDiagramsPerPage);
            setPendingItemsPerPage(newDiagramsPerPage);
            setCurrentPage((prev) => Math.min(prev, newTotalPages));

            if (shouldAnimate) {
                setTimeout(
                    () =>
                        setAnimationState({ ...animationState, type: 'none' }),
                    250
                );
            }
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
    }, [pendingDiagrams.length, diagramsPerPage, currentPage]);

    const onSwitchConfirmSubmit = async (action: 'Yes' | 'No' | 'Save') => {
        switch (action) {
            case 'Yes':
                setEditingIndex(-1);
                navigateToPage(delta);
                break;
            case 'Save':
                const validated = !!(await handleSaveEditing());
                if (!validated) {
                    return;
                }
                navigateToPage(delta);
                break;
        }
    };

    useEffect(() => {
        if (diagrams !== pendingDiagrams && !animationState.isTransition) {
            setAnimationState({ ...animationState, type: 'content-change' });

            setTimeout(() => {
                setPendingDiagrams(diagrams);
                setAnimationState({ ...animationState, type: 'none' });
            }, 200);
        } else if (!animationState.isTransition) {
            setPendingDiagrams(diagrams);
        }
    }, [diagrams, pendingDiagrams, animationState]);

    const visibleDiagrams = useMemo(() => {
        const itemsPerPage = pendingItemsPerPage;
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        return pendingDiagrams.slice(startIdx, endIdx);
    }, [pendingDiagrams, currentPage, pendingItemsPerPage]);

    const getPageChangeButtonLabel = (type: 'previous' | 'next') => {
        let msg;
        switch (type) {
            case 'next':
                msg =
                    currentPage < totalPages
                        ? 'Go to next page'
                        : 'No next page';
                break;
            case 'previous':
                msg =
                    currentPage > 1
                        ? 'Go to previous page'
                        : 'No previous page';
                break;
        }
        msg = editingIndex !== -1 ? `${msg} (confirm?)` : msg;

        return msg;
    };

    return (
        <>
            <ReactObsidianSetting name="Available diagrams" setHeading />

            <ReactObsidianSetting
                name="Diagrams per page"
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
                        onClick={() => changePage(-1)}
                        disabled={currentPage === 1}
                        aria-label={getPageChangeButtonLabel('previous')}
                    >
                        <ArrowLeft size={'20px'} />
                    </PaginationButton>
                    {`Page ${currentPage} of ${totalPages} (Total diagrams: ${pendingDiagrams.length})`}
                    <PaginationButton
                        onClick={() => changePage(1)}
                        disabled={currentPage === totalPages}
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
            <DiagramContainer animationType={animationState.type}>
                {visibleDiagrams.map((diagram, index) => {
                    const { name, selector } = diagram;
                    return (
                        <DiagramItem
                            key={`${name}-${selector}-${index}`}
                            diagram={diagram}
                            editingIndex={editingIndex}
                            index={actualIndex(index)}
                            setEditingIndex={setEditingIndex}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onSaveEditing={handleSaveEditing}
                            setIsDiagramOptionsOpen={setIsDiagramOptionsOpen}
                            setOptionDiagramIndex={setOptionDiagramIndex}
                        />
                    );
                })}
            </DiagramContainer>

            {isSwitchConfirmOpen && (
                <SwitchPageConfirmModal
                    diagramName={diagrams[actualIndex(editingIndex)].name}
                    onClose={() => setIsSwitchConfirmOpen(false)}
                    onSubmit={onSwitchConfirmSubmit}
                />
            )}
            {isDiagramOptionsOpen && (
                <DiagramOptionsModal
                    diagramIndex={optionDiagramIndex}
                    onChanges={updateUndoStack}
                    onClose={() => {
                        setIsDiagramOptionsOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default AvailableDiagrams;
