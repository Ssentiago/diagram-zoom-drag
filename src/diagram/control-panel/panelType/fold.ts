import { PanelType } from '../typing/interfaces';
import { Diagram } from '../../diagram';
import { ControlPanel } from '../control-panel';
import { updateButton } from '../helpers/helpers';
import { EventID } from '../../../events-management/typing/constants';
import { FoldStateChanged } from '../../../events-management/typing/interface';

export class FoldPanel implements PanelType {
    panel!: HTMLElement;
    private container!: HTMLElement;

    constructor(
        private readonly diagram: Diagram,
        private readonly diagramControlPanel: ControlPanel
    ) {}
    /**
     * Initialize the fold panel.
     *
     * This method creates the HTML element of the fold panel and assigns it to the `panel` property.
     */
    initialize(): void {
        this.container = this.diagram.activeContainer!;
        this.panel = this.createPanel();
        this.diagram.plugin.observer.subscribe(
            this.diagram.plugin.app.workspace,
            EventID.FoldStateChanged,
            async (event: FoldStateChanged) => {
                const { containerID, folded } = event.data;
                if (containerID !== this.container.id) {
                    return;
                }
                this.changeFoldState(this.container, folded);
            }
        );
    }
    /**
     * Return an array of objects representing the buttons in the fold panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The fold panel has only one button, which toggles the folded state of the container.
     *
     * @param container The container to which the fold panel is attached.
     * @returns An array of objects representing the buttons in the fold panel.
     */
    getButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }> {
        const isFolded =
            this.diagram.activeContainer?.dataset.folded === 'true';
        return [
            {
                icon: isFolded ? 'unfold-vertical' : 'fold-vertical',
                action: (): void => {
                    this.toggleFoldState(container);
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
        const foldPanel = this.diagramControlPanel.createPanel(
            'diagram-fold-panel',
            {
                position: 'absolute',
                left: '50%',
                bottom: '0',
                transform: 'translateX(-50%)',
                gridTemplateColumns: '1fr',
            }
        );

        const foldButtons = this.getButtons(this.container);

        foldButtons.forEach((button) => {
            const btn = this.diagramControlPanel.createButton(
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

    toggleFoldState(container: HTMLElement): void {
        const isCurrentlyFolded = container.dataset.folded === 'true';
        container.setAttribute('data-folded', `${!isCurrentlyFolded}`);
        this.diagram.updateDiagramSize(container);
        this.handleFoldStateChange(container, !isCurrentlyFolded);
    }

    changeFoldState(container: HTMLElement, isFolded: boolean): void {
        container.setAttribute('data-folded', `${isFolded}`);
        this.diagram.updateDiagramSize(container);
        this.handleFoldStateChange(container, isFolded);
    }

    handleFoldStateChange(container: HTMLElement, isFolded: boolean): void {
        const panels: NodeListOf<HTMLElement> = container.querySelectorAll(
            '.diagram-zoom-drag-panel:not(.diagram-fold-panel)'
        );
        panels.forEach((panel) => {
            panel.toggleClass('hidden', isFolded);
            panel.toggleClass('visible', !isFolded);
        });

        const button: HTMLElement | null = container.querySelector(
            '#diagram-fold-button'
        );
        if (button) {
            updateButton(
                button,
                isFolded ? 'unfold-vertical' : 'fold-vertical',
                isFolded ? 'Expand diagram' : 'Fold diagram'
            );
        }
    }
}
