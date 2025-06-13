import { BasePanel } from './base-panel';
import { IControlPanel } from '../typing/interfaces';
import { TriggerType } from '../../typing/constants';
import { updateDiagramSize } from '../../helpers';
import { setTooltip } from 'obsidian';

export class FoldPanel extends BasePanel {
    constructor(public readonly controlPanel: IControlPanel) {
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
        super.initialize();
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
                    const button = this.panel.querySelector(
                        '#diagram-fold-buttoч   n'
                    ) as HTMLButtonElement;
                    setTooltip(
                        button,
                        isFolded ? 'Fold diagram' : 'Expand diagram'
                    );
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
    setupPanelContents(): void {
        const foldButtons = this.getButtons();

        foldButtons.forEach((button) => {
            const btn = this.createButton(
                button.icon,
                button.action,
                button.title,
                true,
                button.id
            );
            this.panel.appendChild(btn);
        });
    }

    fold() {
        this.diagram.container.setAttribute('data-folded', 'true');
        updateDiagramSize(
            this.diagram.container,
            this.diagram.diagramDescriptor.size,
            this.diagram.plugin.settings.data.diagrams.size,
            this.diagram.plugin.isInLivePreviewMode
        );
        this.controlPanel.hide(TriggerType.FOLD);
    }

    unfold() {
        this.diagram.container.setAttribute('data-folded', 'false');
        updateDiagramSize(
            this.diagram.container,
            this.diagram.diagramDescriptor.size,
            this.diagram.plugin.settings.data.diagrams.size,
            this.diagram.plugin.isInLivePreviewMode
        );
        this.controlPanel.show(TriggerType.FOLD);
    }

    protected get supportedTriggers(): number {
        return (
            super.supportedTriggers &
            ~TriggerType.FOLD &
            ~TriggerType.SERVICE_HIDING &
            ~TriggerType.FOCUS
        );
    }
}
