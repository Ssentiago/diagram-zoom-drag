import styled from 'styled-components';

export const NavbarContainer = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background-color: var(--background-primary);
    color: var(--text-normal);
    border-bottom: 2px solid var(--background-modifier-border);
`;

export const NavbarTabs = styled.div`
    display: flex;
    gap: 16px;
`;

export const NavbarTab = styled.button`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    text-decoration: none;
    color: var(--text-normal);
    font-size: 16px;
    padding: 8px 12px;
    gap: 10px;
    border-radius: 4px;
    transition:
        background-color 0.3s,
        color 0.3s;
    cursor: pointer;
    position: relative;

    &:hover {
        background-color: var(--background-modifier-hover);
        color: var(--text-accent-hover);
    }

    &.active {
        background-color: var(--background-modifier-active-hover);
        color: var(--text-accent);
    }

    &.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 3px;
        background-color: var(--text-accent);
        border-radius: 2px 2px 0 0;
    }
`;
