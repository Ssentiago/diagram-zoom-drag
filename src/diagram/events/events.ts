import { MouseHandler } from './handlers/mouseHandler';
import { TouchHandler } from './handlers/touchHandler';
import { KeyboardHandler } from './handlers/keyboardHandler';
import { FocusHandler } from './handlers/focus-handler';
import { DiagramData } from '../../settings/typing/interfaces';
import Diagram from '../diagram';
import { ContextMenu } from './handlers/context-menu/context-menu';
import { Component } from 'obsidian';

export interface Handler {
    initialize(): void;
}

export default class Events extends Component {
    private readonly mouse: MouseHandler;
    private readonly touch: TouchHandler;
    private readonly keyboard: KeyboardHandler;
    private readonly focus: FocusHandler;
    private readonly contextMenu: ContextMenu;

    constructor(public diagram: Diagram) {
        super();
        this.mouse = new MouseHandler(this);
        this.touch = new TouchHandler(this);
        this.keyboard = new KeyboardHandler(this);
        this.focus = new FocusHandler(this);
        this.contextMenu = new ContextMenu(this);

        this.addChild(this.mouse);
        this.addChild(this.touch);
        this.addChild(this.keyboard);
        this.addChild(this.focus);
        this.addChild(this.contextMenu);
    }

    initialize(): void {
        this.mouse.initialize();
        this.touch.initialize();
        this.keyboard.initialize();
        this.focus.initialize();
        this.contextMenu.initialize();
    }

    onunload(): void {
        super.onunload();
        console.log('=== EVENTS UNLOAD START ===');
        console.log('=== EVENTS HANDLER UNLOAD END ===');
    }
}
