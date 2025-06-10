import { Diagram } from '../diagram';
import { MarkdownPostProcessorContext } from 'obsidian';
import { DiagramData } from '../../settings/typing/interfaces';
import hash from 'hash.js';
import { HTMLElementWithCMView } from './typing/interfaces';
import { DiagramSize } from '../state/typing/interfaces';
import { ContainerID } from '../state/typing/types';

export abstract class BaseAdapter {
    constructor(protected diagram: Diagram) {}

    abstract initialize(
        el: Element,
        context?: MarkdownPostProcessorContext
    ): Promise<void>;

    /**
     * This method takes an element and checks if it is a diagram.
     * @param element - The element to check.
     * @returns A promise that resolves to an object with the diagramData and the element,
     * or undefined if the element is not a diagram.
     */
    protected async isThatADiagram(
        element: Element
    ): Promise<
        { diagramData: DiagramData; diagramElement: HTMLElement } | undefined
    > {
        const diagram = this.findDiagram(element);

        const svg = diagram?.diagramElement.querySelector('svg');
        const img = diagram?.diagramElement.querySelector('img');

        if (diagram && (!!svg || !!img)) {
            return diagram;
        }
    }

    /**
     * Searches for and returns a diagram element within the given element.
     *
     * This method iterates over the supported diagrams from the plugin settings,
     * checking if they are enabled. It attempts to find an element matching the
     * diagram's selector using either `closest` or `querySelector` methods. If a
     * matching element is found, it returns an object containing the diagram's
     * data and the found diagram element.
     *
     * @param element - The element within which to search for the diagram.
     * @returns An object containing `diagramData` and `diagramElement` if a matching
     * diagram is found, or `null` if no such diagram exists.
     */
    protected findDiagram(
        element: Element
    ): { diagramData: DiagramData; diagramElement: HTMLElement } | null {
        for (const diagram of this.diagram.plugin.settings.data.diagrams
            .supported_diagrams) {
            if (!diagram.on) {
                continue;
            }

            const diagramElement: HTMLElement | null =
                element.closest(diagram.selector) ??
                element.querySelector(diagram.selector);
            if (diagramElement) {
                return { diagramElement: diagramElement, diagramData: diagram };
            }
        }
        return null;
    }

    /**
     * Gets the size of the diagram element.
     *
     * This method attempts to determine the size of the diagram by getting the
     * bounding rectangle of either the SVG or IMG element within the given
     * element. If both elements are missing, it returns `undefined`.
     *
     * @param el - The element containing the diagram.
     * @returns An object with the diagram's width and height, or `undefined` if
     * the diagram element does not exist.
     */
    protected getDiagramSize(
        el: HTMLElement
    ): { height: number; width: number } | undefined {
        const svg = el.querySelector('svg');
        const img = el.querySelector('img');

        if (svg === null && img === null) {
            return undefined;
        }

        const rect = img
            ? img.getBoundingClientRect()
            : el.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
        };
    }

    /**
     * Generates a unique ID for a diagram container.
     *
     * This method combines the diagram's name, the line numbers for the start and
     * end of the diagram, and the file's creation time to create a unique ID for
     * the diagram container. The ID is then hashed using SHA-256 to provide a
     * unique and consistent identifier.
     *
     * @param lineStart - The line number at which the diagram starts.
     * @param lineEnd - The line number at which the diagram ends.
     * @param diagram - The diagram data for which to generate the ID.
     * @returns A unique ID for the diagram container.
     */
    protected async genID(
        lineStart: number,
        lineEnd: number,
        diagram: DiagramData
    ): Promise<ContainerID> {
        const preId = `${diagram.name}:${lineStart}-${lineEnd}`;
        const hashed_data = hash.sha256().update(preId).digest('hex');
        const ctime = this.diagram.plugin.context.view?.file?.stat.ctime ?? 0;
        return `id-${ctime}-${hashed_data}` as ContainerID;
    }

    /**
     * Extracts source code within a specified context from an HTML element.
     *
     * This method retrieves the section information of the context element
     * using the provided Markdown post-processing context. It extracts the
     * source code from the specified line range within the section.
     *
     * @param el - The HTML element from which to extract the source.
     * @param contextData - An object containing the context element and
     *                      Markdown post-processing context.
     * @returns An object containing the extracted source code and its
     *          starting and ending line numbers. If section info is
     *          unavailable, it returns default values indicating no source.
     */
    protected sourceExtractionWithContext(
        el: HTMLElement,
        contextData: {
            contextElement: HTMLElement;
            context: MarkdownPostProcessorContext;
        }
    ):
        | { source: 'No source available'; lineStart: 0; lineEnd: 0 }
        | {
              source: string;
              lineStart: number;
              lineEnd: number;
          } {
        const sectionsInfo = contextData.context.getSectionInfo(
            contextData.contextElement
        );

        if (!sectionsInfo) {
            return {
                source: 'No source available',
                lineStart: 0,
                lineEnd: 0,
            };
        }
        const { lineStart: ls, lineEnd: le, text } = sectionsInfo;
        const lineStart = ls + 1;
        const lineEnd = le - 1;
        const lines = text.split('\n');
        const source = lines.slice(lineStart, lineEnd + 1).join('\n');

        return {
            source: source,
            lineStart: lineStart,
            lineEnd: lineEnd,
        };
    }

    /**
     * Extracts the source code from a diagram element without using context.
     *
     * This method retrieves the source code and its line numbers from the parent
     * element's CodeMirror view data. If the widget data is unavailable, it returns
     * default values indicating that no source is available.
     *
     * @param el - The HTML element from which to extract the source.
     * @returns An object containing the extracted source code and its starting and
     *          ending line numbers. If the widget data is unavailable, it returns
     *          'No source available' with line numbers set to 0.
     */
    protected sourceExtractionWithoutContext(el: HTMLElement): {
        source: string;
        lineStart: number;
        lineEnd: number;
    } {
        const parent = el.parentElement as HTMLElementWithCMView;
        const widgetData = parent.cmView?.deco?.widget;
        if (!widgetData) {
            return {
                source: 'No source available',
                lineStart: 0,
                lineEnd: 0,
            };
        }

        return {
            source: widgetData.code,
            lineStart: widgetData.lineStart,
            lineEnd: widgetData.lineEnd,
        };
    }

    /**
     * Creates a container element for a diagram and initializes it with the
     * provided diagram and source data.
     *
     * This method creates a new container element for the diagram, sets its class
     * to 'diagram-container', and appends the diagram element to it. It also
     * sets attributes on the container indicating the rendering mode and whether
     * it is folded. Finally, it returns the container element.
     *
     * @param diagram - An object containing the diagram data and the HTML element
     *                  of the diagram.
     * @param sourceData - An object containing the source code and its line
     *                     numbers.
     * @returns A promise that resolves to the container element.
     */
    async createDiagramWrapper(
        diagram: { diagramData: DiagramData; diagramElement: HTMLElement },
        sourceData: {
            source: string;
            lineStart: number;
            lineEnd: number;
        }
    ): Promise<HTMLElement> {
        const container = document.createElement('div');
        const el = diagram.diagramElement;
        el.addClass('diagram-content');

        container.addClass('diagram-container');
        const renderingMode = this.diagram.plugin.isInPreviewMode
            ? 'preview'
            : 'live-preview';
        container.setAttribute(
            'data-diagram-zoom-drag-rendering-mode',
            `${renderingMode}`
        );
        el.parentNode?.insertBefore(container, el);
        container.appendChild(el);

        container.id = await this.genID(
            sourceData.lineStart,
            sourceData.lineEnd,
            diagram.diagramData
        );
        container.setAttribute(
            'data-folded',
            this.diagram.plugin.settings.data.diagrams.folding.foldByDefault.toString()
        );

        container.setAttribute('tabindex', '0');

        return container;
    }

    /**
     * Performs a series of checks to ensure that the adapter is not initialized
     * on an element that has already been initialized, or is not a valid element.
     * @param el - The element to check.
     * @returns `false` if any of the checks fail, `true` otherwise.
     */
    protected initializationGuard(el: HTMLElement): boolean {
        if (!el.parentElement) {
            return false;
        }
        if (el.parentElement.hasClass('diagram-container')) {
            return false;
        }
        if (el.hasClass('diagram-content')) {
            return false;
        }

        return true;
    }

    /**
     * Performs initialization tasks after a diagram container has been created.
     *
     * This method is called after a diagram container has been created and the
     * diagram has been inserted into it. It initializes the container state with
     * default values and sets the source of the diagram. It also initializes the
     * control panel, event handlers, context menu, and updates the diagram size.
     * Finally, it fits the diagram to the container.
     *
     * @param diagram - An object containing the diagram data and the HTML element
     *                  of the diagram.
     * @param container - The container element of the diagram.
     * @param sourceData - An object containing the source code and its line
     *                     numbers.
     * @param size - The size of the diagram.
     */
    protected postInitDiagram(
        diagram: { diagramData: DiagramData; diagramElement: HTMLElement },
        container: HTMLElement,
        sourceData: {
            source: string;
            lineStart: number;
            lineEnd: number;
        },
        size: DiagramSize
    ): void {
        const el = diagram.diagramElement;
        this.diagram.state.initializeContainer(
            container.id,
            sourceData.source,
            size
        );

        this.diagram.controlPanel.initialize(container, diagram.diagramData);
        this.diagram.events.initialize(container, diagram.diagramData);
        this.diagram.contextMenu.initialize(container, diagram.diagramData);
        this.diagram.updateDiagramSize(container);
        this.diagram.actions.fitToContainer(el, container);
    }
}
