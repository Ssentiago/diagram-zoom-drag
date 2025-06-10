import Events from '../events';
import { FoldStateChanged } from '../../../events-management/typing/interface';
import { EventID } from '../../../events-management/typing/constants';

export class FocusHandler {
    constructor(private readonly diagramEvents: Events) {}

    /**
     * Adds focus event listeners to the given container element.
     *
     * This function adds the following event listeners to the given container element:
     * - `focusin`: Handles the focus in event for the container element.
     * - `focusout`: Handles the focus out event for the container element.
     *
     * @param container - The container element to add the focus event listeners to.
     */
    initialize(container: HTMLElement): void {
        if (!this.diagramEvents.diagram.plugin.context.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'focusin',
            this.focusIn.bind(this, container)
        );

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'focusout',
            this.focusOut.bind(this, container)
        );
    }

    /**
     * Handles the focus in event for the container element.
     * If automatic folding on focus change is enabled in the diagram plugin settings,
     * the 'folded' class is removed from the container element.
     * The active container is set to the given container.
     *
     * @param container - The container element where the focus in event occurred.
     */
    private focusIn(container: HTMLElement): void {
        if (
            this.diagramEvents.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.diagramEvents.diagram.activeContainer = container;
            this.publishFoldStateChange(container, false);
        }
    }

    /**
     * Handles the focus out event for the container element.
     * If automatic folding on focus change is enabled in the diagram plugin settings,
     * the 'folded' class is added to the container element.
     *
     * @param container - The container element where the focus out event occurred.
     */
    private focusOut(container: HTMLElement): void {
        if (
            this.diagramEvents.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.publishFoldStateChange(container, true);
        }
    }

    private publishFoldStateChange(
        container: HTMLElement,
        folded: boolean
    ): void {
        const containerID = container.id;
        this.diagramEvents.diagram.plugin.publisher.publish({
            eventID: EventID.FoldStateChanged,
            timestamp: new Date(),
            emitter: this.diagramEvents.diagram.plugin.app.workspace,
            data: {
                containerID,
                folded,
            },
        } as FoldStateChanged);
    }
}
