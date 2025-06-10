import { ControlPanel, TriggerType } from '../control-panel';
import { updateButton } from '../helpers/helpers';
import { EventID } from '../../../events-management/typing/constants';
import { FoldStateChanged } from '../../../events-management/typing/interface';
import { BasePanel } from './base-panel';
import { PanelsTriggering } from '../../../settings/typing/interfaces';

export class FoldPanel extends BasePanel {
    constructor(public readonly controlPanel: ControlPanel) {
        super(controlPanel);
    }

    get enabled(): boolean {
        return true;
    }

    get cssStyles() {
        return {
            position: 'absolute',
            left: '50%',
            bottom: '0',
            transform: 'translateX(-50%)',
            gridTemplateColumns: '1fr',
        };
    }

    get cssClass() {
        return 'diagram-fold-panel';
    }

    /**
     * Initialize the fold panel.
     *
     * This method creates the HTML element of the fold panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.panel = this.createPanel();
    }

    getButtons(): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        const isFolded = this.diagram.container.dataset.folded === 'true';

        return [
            {
                icon: isFolded ? 'unfold-vertical' : 'fold-vertical',
                action: (): void => {
                    const isFolded =
                        this.controlPanel.diagram.container.dataset.folded ===
                        'true';
                    isFolded ? this.unfold() : this.fold();
                },
                title: isFolded ? 'Expand diagram' : 'Fold diagram',
                id: 'diagram-fold-button',
            },
        ];
    }

    /**
     * Creates the HTML element of the fold panel.
     *
     * The fold panel is a container with absolute positioning that is placed at the bottom of the diagram.
     * It contains a single button that toggles the folded state of the container.
     * The button is created using the `getButtons` method and is then appended to the panel.
     *
     * @returns The HTML element of the fold panel.
     */
    createPanel(): HTMLElement {
        const foldPanel = this.createPanelElement();

        const foldButtons = this.getButtons();

        foldButtons.forEach((button) => {
            const btn = this.createButton(
                button.icon,
                button.action,
                button.title,
                true,
                button.id
            );
            foldPanel.appendChild(btn);
        });

        return foldPanel;
    }

    fold() {
        this.diagram.container.setAttribute('data-folded', 'true');
        this.controlPanel.hide(TriggerType.FOLD);
    }

    unfold() {
        this.diagram.container.setAttribute('data-folded', 'false');
        this.controlPanel.show(TriggerType.FOLD);
    }

    protected get supportedTriggers(): number {
        return super.supportedTriggers & ~TriggerType.FOLD;
    }
}
