import { useSettingsContext } from '../../../../../core/SettingsContext';
import { useEffect, useMemo, useState } from 'react';

interface usePaginationProps {
    itemsPerPage: number;
    totalItems: number;
}

export const usePagination = ({
    itemsPerPage,
    totalItems,
}: usePaginationProps) => {
    const { plugin } = useSettingsContext();
    const [page, setPage] = useState(1);
    const [delta, setDelta] = useState(0);
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
        [totalItems, itemsPerPage]
    );
    const pageStartIndex = useMemo(
        () => (page - 1) * itemsPerPage,
        [page, itemsPerPage]
    );

    const pageEndIndex = useMemo(
        () => pageStartIndex + itemsPerPage,
        [pageStartIndex, itemsPerPage]
    );

    useEffect(() => {
        const newTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        setPage((prevPage) => Math.min(prevPage, newTotalPages));
    }, [itemsPerPage, totalItems]);

    const navigateToPage = (delta: number) => {
        setPage((prev) => Math.min(totalPages, Math.max(prev + delta, 1)));
    };

    return {
        page,
        pageStartIndex,
        pageEndIndex,
        delta,
        setDelta,
        totalPages,
        navigateToPage,
    };
};
