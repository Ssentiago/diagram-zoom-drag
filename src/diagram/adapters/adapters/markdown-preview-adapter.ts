import { MarkdownPostProcessorContext } from 'obsidian';
import { BaseAdapter } from '../base-adapter';
import { Diagram } from '../../diagram';
import { DiagramData } from '../../../settings/typing/interfaces';

export class MarkdownPreviewAdapter extends BaseAdapter {
    constructor(diagram: Diagram) {
        super(diagram);
    }

    /**
     * Initializes the adapter by determining and using the appropriate diagram.
     * If the HTML element passed is a diagram, the adapter will process it immediately.
     * If not, the adapter will set up a MutationObserver to wait for the diagram to appear
     * in the element (up to 5 seconds).
     *
     * @param el - The HTML element that represents the diagram.
     * @param context - Optional Markdown post-processing context
     *
     * @returns A promise that resolves once the adapter has been successfully initialized.
     */
    async initialize(
        el: HTMLElement,
        context?: MarkdownPostProcessorContext
    ): Promise<void> {
        if (!context) {
            return;
        }

        const diagram = await this.isThatADiagram(el);
        if (!!diagram) {
            await this.processDiagram(diagram, context);
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

                    const diagram = await this.isThatADiagram(target);
                    if (diagram) {
                        await this.processDiagram(diagram, context);
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
        diagram: {
            diagramData: DiagramData;
            diagramElement: HTMLElement;
        },
        context: MarkdownPostProcessorContext
    ): Promise<void> {
        const canContinue = this.initializationGuard(diagram.diagramElement);
        if (!canContinue) {
            return;
        }
        const sourceData = this.sourceExtractionWithContext(
            diagram.diagramElement,
            {
                contextElement: diagram.diagramElement,
                context: context,
            }
        );
        const size = this.getDiagramSize(diagram.diagramElement);
        if (size === undefined) {
            return;
        }
        const container = await this.createDiagramWrapper(diagram, sourceData);
        this.postInitDiagram(diagram, container, sourceData, size);
    }
}
