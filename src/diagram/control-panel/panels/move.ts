import { ControlPanel } from '../control-panel';
import { PanelsTriggering } from '../../../settings/typing/interfaces';
import { BasePanel } from './base-panel';

export class MovePanel extends BasePanel {
    constructor(controlPanel: ControlPanel) {
        super(controlPanel);
    }

    initialize(): void {
        this.panel = this.createPanel();
    }

    get enabled(): boolean {
        return (
            this.diagram.plugin.settings.data.panels.local.panels.move.on &&
            this.diagram.diagramData.panels.move.on
        );
    }

    get cssClass() {
        return 'diagram-move-panel';
    }

    get cssStyles() {
        return {
            ...this.diagram.plugin.settings.data.panels.local.panels.move
                .position,
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
        };
    }

    /**
     * Returns an array of objects representing the buttons in the move panel.
     *
     * The buttons are objects with the following properties:
     * - `icon`: The icon to display in the button.
     * - `action`: The action to perform when the button is clicked.
     * - `title`: The title of the button.
     * - `active`: Whether the button is active or not.
     * - `id`: The id of the button.
     *
     * The move panel has 8 buttons, each of which moves the container in a different direction.
     *
     * @param container The container to which the move panel is attached.
     * @returns An array of objects representing the buttons in the move panel.
     */
    getButtons(): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
        gridArea: string;
    }> {
        const moveButtons =
            this.diagram.plugin.settings.data.panels.local.panels.move.buttons;
        const buttons = [
            {
                key: 'upLeft',
                icon: 'arrow-up-left',
                title: 'Move up left',
                gridArea: '1 / 1',
                x: 50,
                y: 50,
            },
            {
                key: 'up',
                icon: 'arrow-up',
                title: 'Move up',
                gridArea: '1 / 2',
                x: 0,
                y: 50,
            },
            {
                key: 'upRight',
                icon: 'arrow-up-right',
                title: 'Move up right',
                gridArea: '1 / 3',
                x: -50,
                y: 50,
            },
            {
                key: 'left',
                icon: 'arrow-left',
                title: 'Move left',
                gridArea: '2 / 1',
                x: 50,
                y: 0,
            },
            {
                key: 'right',
                icon: 'arrow-right',
                title: 'Move right',
                gridArea: '2 / 3',
                x: -50,
                y: 0,
            },
            {
                key: 'downLeft',
                icon: 'arrow-down-left',
                title: 'Move down left',
                gridArea: '3 / 1',
                x: 50,
                y: -50,
            },
            {
                key: 'down',
                icon: 'arrow-down',
                title: 'Move down',
                gridArea: '3 / 2',
                x: 0,
                y: -50,
            },
            {
                key: 'downRight',
                icon: 'arrow-down-right',
                title: 'Move down right',
                gridArea: '3 / 3',
                x: -50,
                y: -50,
            },
        ];

        return buttons
            .filter(
                (config) => moveButtons[config.key as keyof typeof moveButtons]
            )
            .map((config) => ({
                icon: config.icon,
                action: () =>
                    this.diagram.actions.moveElement(config.x, config.y, true),
                title: config.title,
                gridArea: config.gridArea,
            }));
    }

    /**
     * Creates the HTML element of the move panel.
     *
     * The move panel is a container with absolute positioning that is placed at the bottom right of the diagram.
     * It contains 8 buttons that move the currently selected container in the diagram.
     * The buttons are created using the `getButtons` method and are then appended to the panel.
     *
     * @returns The HTML element of the move panel.
     */
    createPanel(): HTMLElement {
        const panel = this.createPanelElement();
        panel.toggleClass(
            'hidden',
            this.diagram.plugin.settings.data.panels.global.triggering.mode !==
                PanelsTriggering.ALWAYS
        );

        const moveButtons = this.getButtons();

        moveButtons.forEach((btn) => {
            const button = this.createButton(
                btn.icon,
                btn.action,
                btn.title,
                btn.active,
                btn.id
            );
            button.style.gridArea = btn.gridArea;
            panel.appendChild(button);
        });
        return panel;
    }
}
