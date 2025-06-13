import Events, { Handler } from '../events';

export class KeyboardHandler implements Handler {
    constructor(private readonly diagramEvents: Events) {}

    /**
     * Initializes the keyboard event handler for the given container element.
     *
     * This method adds a keydown event listener to the given container element.
     * When a keydown event occurs, the method {@link keyDown} is called with the
     * container and the event as arguments.
     *
     * @param container - The container element to add the keydown event listener to.
     */
    initialize(): void {
        if (!this.diagramEvents.diagram.plugin.context.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            this.diagramEvents.diagram.container,
            'keydown',
            this.keyDown.bind(this)
        );
    }

    /**
     * Handles key events for the diagram element.
     * If the key pressed is within the allowed keys, it performs specific actions based on the key.
     *
     * @param container - The container element where the key event occurred.
     * @param event - The keyboard event that triggered the function.
     */
    keyDown = (event: KeyboardEvent): void => {
        const key = event.code;
        const KEYS = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Equal',
            'Minus',
            'Digit0',
        ];
        if (!KEYS.includes(key)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();

        switch (key) {
            case 'ArrowUp':
                this.diagramEvents.diagram.actions.moveElement(0, 50, true);
                break;
            case 'ArrowDown':
                this.diagramEvents.diagram.actions.moveElement(0, -50, true);
                break;
            case 'ArrowLeft':
                this.diagramEvents.diagram.actions.moveElement(50, 0, true);
                break;
            case 'ArrowRight':
                this.diagramEvents.diagram.actions.moveElement(-50, 0, true);
                break;
        }

        if (event.ctrlKey) {
            switch (key) {
                case 'Equal':
                    this.diagramEvents.diagram.actions.zoomElement(1.1, true);
                    break;
                case 'Minus':
                    this.diagramEvents.diagram.actions.zoomElement(0.9, true);
                    break;
                case 'Digit0':
                    this.diagramEvents.diagram.actions.resetZoomAndMove(true);
                    break;
            }
        }
    };

    cleanUp() {
        this.diagramEvents.diagram.container.removeEventListener(
            'keydown',
            this.keyDown
        );
    }
}
