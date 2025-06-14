import { Export } from './context-actions/export';
import { Component, Menu } from 'obsidian';
import { CopyDiagram } from './context-actions/copy-diagram';
import { CopyDiagramSource } from './context-actions/copy-diagram-source';
import Events, { Handler } from '../../events';

export class ContextMenu extends Component implements Handler {
    private readonly export: Export;
    private readonly copy: CopyDiagram;
    private readonly copySource: CopyDiagramSource;
    constructor(public readonly events: Events) {
        super();
        this.export = new Export(this);
        this.copy = new CopyDiagram(this);
        this.copySource = new CopyDiagramSource(this);
    }

    initialize(): void {
        const container = this.events.diagram.container;
        this.registerDomEvent(container, 'contextmenu', () => {
            container.addEventListener('contextmenu', this.onContextMenu, {
                capture: true,
                passive: false,
            });
        });
    }

    onContextMenu = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isThereDiagramContainer: HTMLElement | null =
            target.closest('.diagram-container');

        if (!isThereDiagramContainer) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isThisSvg = target.querySelector('svg') ?? target.closest('svg');

        isThereDiagramContainer.focus();

        const menu = new Menu();
        menu.addItem((item) => {
            item.setTitle('Export diagram image');
            item.onClick(async () => {
                this.export.export();
            });
        });

        menu.addItem((item) => {
            item.setTitle(`Copy diagram ${!isThisSvg ? 'image' : 'SVG code'}`);
            item.onClick(async () => {
                await this.copy.copy();
            });
        });

        menu.addItem((item) => {
            item.setTitle('Copy diagram source');
            item.onClick(async () => {
                await this.copySource.copy();
            });
        });

        menu.showAtMouseEvent(event);
    };

    onunload() {
        super.onunload();

        this.events.diagram.container.removeEventListener(
            'contextmenu',
            this.onContextMenu,
            { capture: true }
        );
    }
}
