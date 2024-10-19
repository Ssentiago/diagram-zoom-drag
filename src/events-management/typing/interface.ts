import { EventID } from './constants';
import { Events } from 'obsidian';

export interface DiagramZoomDragEvent {
    eventID: EventID;
    timestamp: Date;
    emitter: Events;
}

export interface PanelsChangedVisibility extends DiagramZoomDragEvent {
    data: {
        visible: boolean;
    };
}
