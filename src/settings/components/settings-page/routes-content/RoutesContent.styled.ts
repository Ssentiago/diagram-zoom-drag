import styled from 'styled-components';

export const AnimatedRoutes = styled.div<{ $stage: 'fadeIn' | 'fadeOut' }>`
    &.fadeIn {
        animation: 0.25s routeFadeIn forwards;
    }

    &.fadeOut {
        animation: 0.2s routeFadeOut forwards;
    }

    @keyframes routeFadeIn {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes routeFadeOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(-5px) scale(0.99);
        }
    }
`;
