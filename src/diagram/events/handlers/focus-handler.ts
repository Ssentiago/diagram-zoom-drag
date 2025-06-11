import Events, { Handler } from '../events';
import { FoldStateChanged } from '../../../events-management/typing/interface';
import { EventID } from '../../../events-management/typing/constants';
import { TriggerType } from '../../control-panel/control-panel';

export class FocusHandler implements Handler {
    constructor(private readonly events: Events) {}

    /**
     * Adds focus event listeners to the given container element.
     *
     * This function adds the following event listeners to the given container element:
     * - `focusin`: Handles the focus in event for the container element.
     * - `focusout`: Handles the focus out event for the container element.
     *
     * @param container - The container element to add the focus event listeners to.
     */
    initialize(): void {
        if (!this.events.diagram.plugin.context.view) {
            return;
        }

        const container = this.events.diagram.container;

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'focusin',
            this.focusIn.bind(this)
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'focusout',
            this.focusOut.bind(this)
        );
    }

    private focusIn(): void {
        if (
            this.events.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.events.diagram.controlPanel.fold.fold();
        }
        this.events.diagram.controlPanel.show(TriggerType.FOCUS);
    }

    private focusOut(): void {
        if (
            this.events.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.events.diagram.controlPanel.fold.fold();
        }
        this.events.diagram.controlPanel.hide(TriggerType.FOCUS);
    }

    cleanUp() {
        this.events.diagram.container.removeEventListener(
            'focusin',
            this.focusIn
        );
        this.events.diagram.container.removeEventListener(
            'focusout',
            this.focusOut
        );
    }
}
