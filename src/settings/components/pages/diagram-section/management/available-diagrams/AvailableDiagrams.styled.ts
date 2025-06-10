import styled from 'styled-components';

import { AnimationType } from './typing/types';

export const ButtonContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background-color: var(--color-base-30);
        margin-top: 20px;
    }
`;

export const PaginationButton = styled.button`
    &:disabled {
        background-color: var(--color-base-50);
        cursor: not-allowed;
    }
`;

export const UndoButton = styled.button`
    margin-right: auto; /* Прижимаем к левому краю */
    &:disabled {
        background-color: var(--color-base-50);
        cursor: not-allowed;
    }
`;

export const RedoButton = styled.button`
    margin-left: auto; /* Прижимаем к правому краю */
    &:disabled {
        background-color: var(--color-base-50);
        cursor: not-allowed;
    }
`;
export const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;
export const DiagramContainer = styled.div<{ animationType: AnimationType }>`
    transition: ${(props) => {
        switch (props.animationType) {
            case 'page-change':
                return 'opacity 0.25s ease-in-out, transform 0.25s ease-in-out'; // было 0.2s
            case 'content-change':
                return 'transform 0.2s ease-in-out, opacity 0.15s ease-out';
            case 'layout-change':
                return 'all 0.25s ease-in-out';
            default:
                return 'none';
        }
    }};

    opacity: ${(props) => {
        switch (props.animationType) {
            case 'page-change':
                return 0.7;
            case 'content-change':
                return 0.6;
            case 'layout-change':
                return 0.5;
            default:
                return 1;
        }
    }};

    transform: ${(props) => {
        switch (props.animationType) {
            case 'page-change':
                return 'translateX(10px)';
            case 'content-change':
                return 'translateY(-5px)';
            case 'layout-change':
                return 'scale(0.96) translateY(-8px)';
            default:
                return 'translateX(0) translateY(0) scale(1)';
        }
    }};
`;
