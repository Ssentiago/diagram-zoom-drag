import DiagramZoomDragPlugin from './diagram-zoom-drag-plugin';
import Diagram from '../diagram/diagram';
import { Component, FileStats } from 'obsidian';

export interface Data {
    diagrams: Diagram[];
    livePreviewObserver?: MutationObserver;
}

export type LeafID = string & { readonly __brand: 'LeafID' };

export default class State {
    data = new Map<LeafID, Data>();

    constructor(private plugin: DiagramZoomDragPlugin) {}

    initializeLeaf(leafID: LeafID): void {
        if (!this.data.get(leafID)) {
            this.data.set(leafID, {
                diagrams: [],
                livePreviewObserver: undefined,
            });
            this.plugin.logger.debug(
                `Initialized data for leaf width id: ${leafID}...`
            );
        }
    }

    cleanupLeaf(leafID: LeafID): void {
        const data = this.data.get(leafID);
        if (!data) {
            this.plugin.logger.error(`No data for leaf`, { leafID });
            return;
        }

        data.diagrams.forEach((d, index) => {
            d.unload();
            this.plugin.logger.debug(`Unloaded diagram`, {
                diagramName: d.diagramDescriptor.diagramData.name,
            });
        });
        data.livePreviewObserver?.disconnect();
        data.livePreviewObserver = undefined;
        this.data.delete(leafID);
        this.plugin.logger.debug(
            `Data for leaf with id ${leafID} was cleaned successfully.`
        );
    }

    clear(): void {
        this.plugin.logger.debug('Started to clear state...');
        for (const leafID of this.data.keys()) {
            this.cleanupLeaf(leafID);
        }
        this.plugin.logger.debug('State was cleared successfully.');
    }

    getLivePreviewObserver(leafID: LeafID): MutationObserver | undefined {
        return this.data.get(leafID)?.livePreviewObserver;
    }
    setLivePreviewObserver(leafID: LeafID, observer: MutationObserver): void {
        const data = this.data.get(leafID);
        if (data) {
            data.livePreviewObserver = observer;
        }
    }

    getDiagrams(leafID: LeafID): any[] {
        return this.data.get(leafID)?.diagrams ?? [];
    }

    pushDiagram(leafID: LeafID, diagram: Diagram): void {
        const data = this.data.get(leafID);
        if (!data) {
            this.plugin.logger.error(`No data for leafID: ${leafID}`);
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
            this.plugin.logger.error(`No data for leafID: ${leafID}`);
            return;
        }

        const currentFileCtime = currentFileStats.ctime;

        data.diagrams = data.diagrams.filter((diagram) => {
            if (currentFileCtime !== diagram.fileStats.ctime) {
                diagram.unload();
                this.plugin.logger.debug(
                    `Cleaned up diagram with id ${diagram.id} due to file change`
                );
                return false;
            }
            return true;
        });
    }
}
