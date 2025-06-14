import Events, { Handler } from '../events';

import { TriggerType } from '../../typing/constants';
import { Component } from 'obsidian';

export class FocusHandler extends Component implements Handler {
    constructor(private readonly events: Events) {
        super();
    }

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
            this.focusIn
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'focusout',
            this.focusOut
        );
    }

    private focusIn = (): void => {
        if (
            this.events.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.events.diagram.controlPanel.fold.unfold();
        }
        this.events.diagram.controlPanel.show(TriggerType.FOCUS);
    };

    private focusOut = (): void => {
        if (
            this.events.diagram.plugin.settings.data.diagrams.folding
                .autoFoldOnFocusChange
        ) {
            this.events.diagram.controlPanel.fold.fold();
        }
        this.events.diagram.controlPanel.hide(TriggerType.FOCUS);
    };

    onunload() {
        super.onunload();

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
