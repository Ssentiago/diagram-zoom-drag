import { MouseHandler } from './handlers/mouseHandler';
import { TouchHandler } from './handlers/touchHandler';
import { KeyboardHandler } from './handlers/keyboardHandler';
import { FocusHandler } from './handlers/focus-handler';
import { DiagramData } from '../../settings/typing/interfaces';
import Diagram from '../diagram';
import { ContextMenu } from './handlers/context-menu/context-menu';

export interface Handler {
    initialize(): void;
    cleanUp(): void;
}

export default class Events {
    private readonly mouse: MouseHandler;
    private readonly touch: TouchHandler;
    private readonly keyboard: KeyboardHandler;
    private readonly focus: FocusHandler;
    private readonly contextMenu: ContextMenu;

    constructor(public diagram: Diagram) {
        this.mouse = new MouseHandler(this);
        this.touch = new TouchHandler(this);
        this.keyboard = new KeyboardHandler(this);
        this.focus = new FocusHandler(this);
        this.contextMenu = new ContextMenu(this);
    }

    initialize(): void {
        this.mouse.initialize();
        this.touch.initialize();
        this.keyboard.initialize();
        this.focus.initialize();
        this.contextMenu.initialize();
    }

    cleanUp() {
        [
            this.mouse,
            this.touch,
            this.keyboard,
            this.focus,
            this.contextMenu,
        ].forEach((handler) => handler.cleanUp());
    }
}
