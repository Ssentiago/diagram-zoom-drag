import styled from 'styled-components';

export const MiniNavbar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid var(--color-base-30);

    .button-active {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        transform: scale(1.05);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    }
`;

export const AnimatedRoutes = styled.div<{ $stage: 'fadeIn' | 'fadeOut' }>`
    &.fadeIn {
        animation: 0.2s fadeIn forwards;
    }

    &.fadeOut {
        animation: 0.15s fadeOut forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(15px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-10px);
        }
    }
`;

export const AnimatedMainRoutes = styled.div<{ $stage: 'fadeIn' | 'fadeOut' }>`
    &.fadeIn {
        animation: 0.25s mainFadeIn forwards;
    }

    &.fadeOut {
        animation: 0.2s mainFadeOut forwards;
    }

    @keyframes mainFadeIn {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes mainFadeOut {
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
