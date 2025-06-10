import { ContainerID } from './types';
import { MovePanel } from '../../control-panel/panelType/move';
import { ZoomPanel } from '../../control-panel/panelType/zoom';
import { FoldPanel } from '../../control-panel/panelType/fold';
import { ServicePanel } from '../../control-panel/panelType/service';

export interface PanelsData {
    panels?: {
        move: MovePanel;
        fold: FoldPanel;
        zoom: ZoomPanel;
        service: ServicePanel;
    };
    controlPanel?: HTMLElement;
}

export interface DiagramSize {
    width: number;
    height: number;
}

interface ContainerData {
    size: DiagramSize;
    dx: number;
    dy: number;
    scale: number;
    nativeTouchEventsEnabled: boolean;
    source?: string;
    panelsData: PanelsData;
}

export interface Data {
    containers: {
        [key: ContainerID]: ContainerData;
    };
    livePreviewObserver?: MutationObserver;
}
