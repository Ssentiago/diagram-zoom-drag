import DiagramZoomDragPlugin from './diagram-zoom-drag-plugin';
import Diagram from '../diagram/diagram';
import { FileStats } from 'obsidian';

export interface Data {
    diagrams: Diagram[];
    livePreviewObserver?: MutationObserver;
}

export type LeafID = string & { readonly __brand: 'LeafID' };

export default class State {
    data = new Map<LeafID, Data>();

    constructor(private plugin: DiagramZoomDragPlugin) {}

    initializeLeaf(leafID: LeafID) {
        if (!this.data.get(leafID)) {
            this.data.set(leafID, {
                diagrams: [],
                livePreviewObserver: undefined,
            });
        }
    }

    cleanupLeaf(leafID: LeafID) {
        const data = this.data.get(leafID);
        if (!data) {
            return;
        }
        data.diagrams.forEach(
            (d) =>
                // d.active ...
                // d.cleanup()
                d
        );
        data.livePreviewObserver?.disconnect();
        data.livePreviewObserver = undefined;
        this.data.delete(leafID);
    }

    clear() {
        for (const leafID of this.data.keys()) {
            this.cleanupLeaf(leafID);
        }
    }

    getLivePreviewObserver(leafID: LeafID) {
        return this.data.get(leafID)?.livePreviewObserver;
    }
    setLivePreviewObserver(leafID: LeafID, observer: MutationObserver) {
        const data = this.data.get(leafID);
        if (data) {
            data.livePreviewObserver = observer;
        }
    }

    getDiagrams(leafID: LeafID) {
        return this.data.get(leafID)?.diagrams;
    }

    pushDiagram(leafID: LeafID, diagram: Diagram) {
        const data = this.data.get(leafID);
        if (!data) {
            console.error(`No data for leafID: ${leafID}`);
            return;
        }
        data.diagrams.push(diagram);
    }

    async cleanupDiagramsOnFileChange(
        leafID: LeafID,
        currentFileStats: FileStats
    ): Promise<void> {
        const data = this.data.get(leafID);
        if (!data) {
            return;
        }

        const currentFileCtime = currentFileStats.ctime;

        data.diagrams = data.diagrams.filter((diagram) => {
            if (currentFileCtime !== diagram.fileStats.ctime) {
                diagram.cleanUp();
                return false;
            }
            return true;
        });
    }
}
