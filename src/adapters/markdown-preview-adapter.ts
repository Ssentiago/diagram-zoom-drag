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
        this.plugin.logger.debug('MarkdownPreviewAdapter initializing', {
            leafID,
        });

        if (!context) {
            this.plugin.logger.warn(
                'No context provided for MarkdownPreviewAdapter'
            );
            return;
        }

        const contextData = {
            context: context,
            contextEl: el,
        };

        const diagramDescriptor = await this.isThatADiagram(el);
        if (!!diagramDescriptor) {
            this.plugin.logger.debug('Found immediate diagram in preview mode');
            await this.processDiagram(leafID, diagramDescriptor, contextData);
            return;
        }

        this.plugin.logger.debug('Creating MutationObserver for preview mode', {
            timeout: 5000,
        });

        const observer = new MutationObserver(async (mutations) => {
            this.plugin.logger.debug('Preview MutationObserver triggered', {
                mutationsCount: mutations.length,
            });

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
            this.plugin.logger.debug(
                'Preview MutationObserver disconnected after timeout'
            );
        }, 5000);
    }

    async processDiagram(
        leafID: LeafID,
        diagramDescriptor: BaseDiagramDescriptor,
        contextData: ContextData
    ): Promise<void> {
        this.plugin.logger.debug('Processing diagram in preview mode', {
            diagramType: diagramDescriptor.diagramData.name,
        });

        const canContinue = this.initializationGuard(
            diagramDescriptor.diagramElement
        );
        if (!canContinue) {
            return;
        }

        const sourceData = this.sourceExtractionWithContext(contextData);
        const size = this.getDiagramSize(diagramDescriptor);
        if (size === undefined) {
            this.plugin.logger.warn('Cannot get diagram size, skipping');
            return;
        }
        const container = await this.createDiagramWrapper(
            diagramDescriptor,
            sourceData
        );
        this.createDiagram(diagramDescriptor, container, sourceData, size);
        this.plugin.logger.debug(
            'Diagram processed successfully in preview mode'
        );
    }
}
