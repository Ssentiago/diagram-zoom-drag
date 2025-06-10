import { useMemo, useState } from 'react';

import { AnimationState } from '../typing/interfaces';

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage: number;
    editingIndex?: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    animationState: AnimationState;
    setAnimationState: React.Dispatch<React.SetStateAction<AnimationState>>;
}

export const usePagination = ({
    totalItems,
    itemsPerPage,
    editingIndex,
    currentPage,
    setCurrentPage,
    setAnimationState,
}: UsePaginationProps) => {
    const [delta, setDelta] = useState(0);
    const [isSwitchConfirmOpen, setIsSwitchConfirmOpen] = useState(false);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
        [totalItems, itemsPerPage]
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const navigateToPage = (delta: number) => {
        setAnimationState({
            type: 'page-change',
            isTransition: true,
        });
        setTimeout(() => {
            setCurrentPage((prev) => {
                return Math.min(totalPages, Math.max(prev + delta, 1));
            });
            setAnimationState({
                type: 'none',
                isTransition: false,
            });
        }, 200);
    };
    const changePage = (delta: number): void => {
        if (editingIndex !== -1) {
            setDelta(delta);
            setIsSwitchConfirmOpen(true);
        } else {
            navigateToPage(delta);
        }
    };

    const actualIndex = (index: number): number => startIndex + index;

    return {
        totalPages,
        startIndex,
        endIndex,
        changePage,
        navigateToPage,
        actualIndex,
        delta,
        isSwitchConfirmOpen,
        setIsSwitchConfirmOpen,
    };
};
