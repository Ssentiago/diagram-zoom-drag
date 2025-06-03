import { Diagram } from '../diagram';
import { MouseHandler } from './eventHandlers/mouseHandler';
import { TouchHandler } from './eventHandlers/touchHandler';
import { KeyboardHandler } from './eventHandlers/keyboardHandler';
import { FocusHandler } from './eventHandlers/focus-handler';
import { DiagramData } from '../../settings/typing/interfaces';

export default class Events {
    private readonly mouse: MouseHandler;
    private readonly touch: TouchHandler;
    private readonly keyboard: KeyboardHandler;
    private readonly focus: FocusHandler;

    constructor(public diagram: Diagram) {
        this.mouse = new MouseHandler(this);
        this.touch = new TouchHandler(this);
        this.keyboard = new KeyboardHandler(this);
        this.focus = new FocusHandler(this);
    }

    /**
     * Initializes all the event handlers and observers for the given container
     * element.
     *
     * The event handlers are initialized in the order of mouse, touch, keyboard,
     * and focus. The folding observer is initialized last.
     *
     * @param container - The container element to add the event handlers and
     * observers to.
     * @param diagramData
     */
    initialize(container: HTMLElement, diagramData: DiagramData): void {
        this.mouse.initialize(container);
        this.touch.initialize(container);
        this.keyboard.initialize(container);
        this.focus.initialize(container);
    }
}
