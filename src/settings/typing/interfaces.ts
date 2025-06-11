import { DimensionUnit } from './types';

export interface DiagramData {
    name: string;
    selector: string;
    on: boolean;
    panels: {
        [key: string]: {
            on: boolean;
        };
    };
}
export interface DragItem {
    panelName: string;
    offsetX: number;
    offsetY: number;
}
export type EdgePosition = 'top' | 'bottom' | 'left' | 'right';

export interface PanelPosition {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface PanelConfig {
    enabled: boolean;
    position: PanelPosition;
}

export interface PanelsConfig {
    service: PanelConfig;
    move: PanelConfig;
    zoom: PanelConfig;
}

export interface DimensionSetting {
    width: {
        value: number;
        unit: DimensionUnit;
    };
    height: {
        value: number;
        unit: DimensionUnit;
    };
}

export enum PanelsTriggering {
    ALWAYS = 'always',
    HOVER = 'hover',
    FOCUS = 'focus',
}

export interface Position {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface Panels {
    global: {
        triggering: {
            mode: PanelsTriggering;
            ignoreService: boolean;
        };
    };
    local: {
        panels: {
            service: {
                on: boolean;
                buttons: {
                    hide: boolean;
                    fullscreen: boolean;
                };
                position: Position;
            };
            move: {
                on: boolean;
                buttons: {
                    up: boolean;
                    down: boolean;
                    left: boolean;
                    right: boolean;
                    upLeft: boolean;
                    upRight: boolean;
                    downLeft: boolean;
                    downRight: boolean;
                };
                position: Position;
            };
            zoom: {
                on: boolean;
                buttons: {
                    in: boolean;
                    out: boolean;
                    reset: boolean;
                };
                position: Position;
            };
        };
        preset: 'mobile' | 'desktop' | 'presentation' | '';
    };
}

export interface Diagrams {
    settingsPagination: {
        perPage: number;
    };
    folding: {
        foldByDefault: boolean;
        autoFoldOnFocusChange: boolean;
    };
    size: {
        expanded: DimensionSetting;
        folded: DimensionSetting;
    };
    supported_diagrams: DiagramData[];
}

export enum DebugLevel {
    None = 'none',
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export interface DefaultSettings {
    panels: Panels;
    diagrams: Diagrams;
    debug: {
        enabled: boolean;
        level: DebugLevel;
    };
}
