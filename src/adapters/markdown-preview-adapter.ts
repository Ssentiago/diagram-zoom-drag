import { MarkdownPostProcessorContext } from 'obsidian';
import { BaseAdapter, ContextData } from './base-adapter';
import { DiagramData } from '../settings/typing/interfaces';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { LeafID } from '../core/state';
import { FileStats } from '../diagram/diagram';

export interface BaseDiagramDescriptor {
    diagramData: DiagramData;
    diagramElement: HTMLElement;
}

export class MarkdownPreviewAdapter extends BaseAdapter {
    constructor(plugin: DiagramZoomDragPlugin, fileStats: FileStats) {
        super(plugin, fileStats);
    }

    async initialize(
        leafID: LeafID,
        el: HTMLElement,
        context?: MarkdownPostProcessorContext,
        hasLivePreviewObserver?: boolean
    ): Promise<void> {
        if (!context) {
            return;
        }
        const contextData = {
            context: context,
            contextEl: el,
        };

        const diagramDescriptor = await this.isThatADiagram(el);
        if (!!diagramDescriptor) {
            await this.processDiagram(leafID, diagramDescriptor, contextData);
            return;
        }

        const observer = new MutationObserver(async (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') {
                    continue;
                }
                for (const addedNode of Array.from(mutation.addedNodes)) {
                    if (!(addedNode instanceof Element)) {
                        continue;
                    }
                    const target = addedNode;

                    const diagramDescriptor = await this.isThatADiagram(target);
                    if (diagramDescriptor) {
                        await this.processDiagram(
                            leafID,
                            diagramDescriptor,
                            contextData
                        );
                    }
                }
            }
        });

        observer.observe(el, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
        }, 5000);
    }

    async processDiagram(
        leafID: LeafID,
        diagramDescriptor: BaseDiagramDescriptor,
        contextData: ContextData
    ): Promise<void> {
        const canContinue = this.initializationGuard(
            diagramDescriptor.diagramElement
        );
        if (!canContinue) {
            return;
        }

        const sourceData = this.sourceExtractionWithContext(contextData);
        const size = this.getDiagramSize(diagramDescriptor);
        if (size === undefined) {
            return;
        }
        const container = await this.createDiagramWrapper(
            diagramDescriptor,
            sourceData
        );
        this.createDiagram(diagramDescriptor, container, sourceData, size);
    }
}
