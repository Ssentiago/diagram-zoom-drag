import { BaseAdapter } from '../base-adapter';
import { Diagram } from '../../diagram';
import { MarkdownPostProcessorContext } from 'obsidian';
import { DiagramData } from '../../../settings/typing/interfaces';

export class MarkdownLivePreviewAdapter extends BaseAdapter {
    constructor(diagram: Diagram) {
        super(diagram);
    }

    /**
     * Initializes the adapter by observing the given element for any added nodes
     * and attempt to process any diagrams that are added.
     *
     * This function is idempotent and will not do anything if the adapter has already
     * been initialized.
     *
     * @param el - The HTML element that represents the live preview content.
     * @param context - Optional Markdown post-processing context.
     *
     * @returns A promise that resolves once the adapter has been successfully initialized.
     */
    async initialize(
        el: HTMLElement,
        context?: MarkdownPostProcessorContext
    ): Promise<void> {
        if (this.diagram.livePreviewObserver) {
            return;
        }

        this.diagram.livePreviewObserver = new MutationObserver(
            async (mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type !== 'childList') {
                        continue;
                    }
                    for (const addedNode of Array.from(mutation.addedNodes)) {
                        if (!(addedNode instanceof Element)) {
                            continue;
                        }
                        const target = addedNode;

                        const diagram = await this.isThatADiagram(target);
                        if (diagram) {
                            await this.processDiagram(diagram);
                        }
                    }
                }
            }
        );

        const livePreviewBlocks = el.querySelectorAll(
            '.cm-preview-code-block.cm-embed-block'
        );
        for (const block of Array.from(livePreviewBlocks)) {
            const diagram = await this.isThatADiagram(block);
            if (diagram) {
                await this.processDiagram(diagram);
            }
        }

        this.diagram.livePreviewObserver.observe(el, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * Processes a diagram by initializing it, extracting source data,
     * determining its size, and creating a wrapper container.
     *
     * This method performs a sequence of operations on a diagram element:
     * it checks initialization conditions, extracts the diagram's source
     * data, assesses its size, and creates a wrapper container. If the
     * diagram meets the required conditions and size is determined, it
     * adds necessary classes for live preview and completes the post-initialization
     * tasks.
     *
     * @param diagram - An object containing the diagram data and the HTML element
     *                  of the diagram.
     * @returns A promise that resolves when the diagram has been fully processed.
     */
    async processDiagram(diagram: {
        diagramData: DiagramData;
        diagramElement: HTMLElement;
    }): Promise<void> {
        const canContinue = this.initializationGuard(diagram.diagramElement);
        if (!canContinue) {
            return;
        }
        const sourceData = this.sourceExtractionWithoutContext(
            diagram.diagramElement
        );
        const size = this.getDiagramSize(diagram.diagramElement);
        if (size === undefined) {
            return;
        }

        diagram.diagramElement.parentElement?.addClass('live-preview-parent');
        const container = await this.createDiagramWrapper(diagram, sourceData);
        container.addClass('live-preview');
        this.postInitDiagram(diagram, container, sourceData, size);
    }
}
