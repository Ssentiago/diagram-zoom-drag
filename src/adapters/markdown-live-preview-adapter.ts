import { BaseAdapter } from './base-adapter';
import { MarkdownPostProcessorContext } from 'obsidian';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { LeafID } from '../core/state';
import { BaseDiagramDescriptor } from './markdown-preview-adapter';
import { FileStats } from '../diagram/diagram';

export class MarkdownLivePreviewAdapter extends BaseAdapter {
    constructor(plugin: DiagramZoomDragPlugin, fileStats: FileStats) {
        super(plugin, fileStats);
    }

    async initialize(
        leafID: LeafID,
        el: HTMLElement,
        context?: MarkdownPostProcessorContext,
        hasExistingObserver?: boolean
    ): Promise<void> {
        this.plugin.logger.debug('MarkdownLivePreviewAdapter initializing', {
            leafID,
            hasExistingObserver,
        });
        const hasLivePreview = !!this.plugin.state.getLivePreviewObserver(
            this.plugin.context.leafID!
        );
        if (hasLivePreview) {
            this.plugin.logger.debug(
                'Live preview observer already exists, skipping initialization'
            );
            return;
        }

        this.plugin.logger.debug(
            'Creating new MutationObserver for live preview'
        );
        const observer = new MutationObserver(async (mutations) => {
            this.plugin.logger.debug(
                'Live preview MutationObserver triggered',
                {
                    mutationsCount: mutations.length,
                }
            );
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
                        await this.processDiagram(diagramDescriptor);
                    }
                }
            }
        });
        this.plugin.state.setLivePreviewObserver(leafID, observer);
        this.plugin.logger.debug('MutationObserver set in state', { leafID });

        const livePreviewBlocks = el.querySelectorAll(
            '.cm-preview-code-block.cm-embed-block'
        );
        this.plugin.logger.debug('Found already existing live preview blocks', {
            count: livePreviewBlocks.length,
        });

        for (const block of Array.from(livePreviewBlocks)) {
            const diagramDescriptor = await this.isThatADiagram(block);
            if (diagramDescriptor) {
                await this.processDiagram(diagramDescriptor);
            }
        }

        observer.observe(el, {
            childList: true,
            subtree: true,
        });
        this.plugin.logger.debug('MutationObserver started observing', {
            leafID,
        });
    }

    async processDiagram(
        diagramDescriptor: BaseDiagramDescriptor
    ): Promise<void> {
        this.plugin.logger.debug('Processing diagram in live preview', {
            diagramType: diagramDescriptor.diagramData.name,
        });
        const canContinue = this.initializationGuard(
            diagramDescriptor.diagramElement
        );
        if (!canContinue) {
            this.plugin.logger.debug(
                'Initialization guard failed for live preview diagram'
            );
            return;
        }
        const sourceData = this.sourceExtractionWithoutContext(
            diagramDescriptor.diagramElement
        );
        const size = this.getDiagramSize(diagramDescriptor);
        if (size === undefined) {
            this.plugin.logger.warn(
                'Cannot get diagram size in live preview, skipping'
            );
            return;
        }

        diagramDescriptor.diagramElement.parentElement?.addClass(
            'live-preview-parent'
        );
        const container = await this.createDiagramWrapper(
            diagramDescriptor,
            sourceData
        );
        container.addClass('live-preview');
        this.createDiagram(diagramDescriptor, container, sourceData, size);
        this.plugin.logger.debug('Live preview diagram processed successfully');
    }
}
