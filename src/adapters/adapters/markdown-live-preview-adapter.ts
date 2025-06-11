import { BaseAdapter } from '../base-adapter';
import { MarkdownPostProcessorContext } from 'obsidian';
import DiagramZoomDragPlugin from '../../core/diagram-zoom-drag-plugin';
import { LeafID } from '../../core/state';
import { BaseDiagramDescriptor } from './markdown-preview-adapter';
import { FileStats } from '../../diagram/diagram';

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
        const hasLivePreview = !!this.plugin.state.getLivePreviewObserver(
            this.plugin.context.leafID!
        );
        if (hasLivePreview) {
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
                        await this.processDiagram(diagramDescriptor);
                    }
                }
            }
        });
        this.plugin.state.setLivePreviewObserver(leafID, observer);

        const livePreviewBlocks = el.querySelectorAll(
            '.cm-preview-code-block.cm-embed-block'
        );
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
    }

    async processDiagram(
        diagramDescriptor: BaseDiagramDescriptor
    ): Promise<void> {
        const canContinue = this.initializationGuard(
            diagramDescriptor.diagramElement
        );
        if (!canContinue) {
            return;
        }
        const sourceData = this.sourceExtractionWithoutContext(
            diagramDescriptor.diagramElement
        );
        const size = this.getDiagramSize(diagramDescriptor);
        if (size === undefined) {
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
    }
}
