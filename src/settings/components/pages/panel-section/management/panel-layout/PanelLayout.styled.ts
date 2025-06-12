import styled from 'styled-components';
import { boolean } from 'superstruct';

export const DiagramSetup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

export const DiagramPreview = styled.div`
    position: relative;
    width: 400px;
    height: 300px;
    border: 2px solid var(--color-base-30);
    margin: 0 auto;
`;

export const PanelPreview = styled.div<{ dragging?: boolean }>`
    position: absolute;
    width: 60px;
    height: 40px; 
    padding: 8px;
    background: var(--color-base-20);
    border-radius: 4px;
    font-size: 0.9em;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: move;
    opacity: ${({ dragging }): 0.5 | 1 => (dragging ? 0.5 : 1)};
    transition: ${({ dragging }): 'all 0.3s ease' | 'none' => (dragging ? 'all 0.3s ease' : 'none')}}
`;

export const FoldPanel = styled(PanelPreview)`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    text-align: justify;
`;

export const PanelControl = styled.div`
    display: flex;
    justify-content: center;
    gap: 20px;
`;

export const PanelToggle = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9em;
`;
