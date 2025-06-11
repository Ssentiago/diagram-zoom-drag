import { ContextMenu } from '../context-menu';

export class CopyDiagramSource {
    constructor(private readonly contextMenu: ContextMenu) {}

    async copy() {
        const source =
            this.contextMenu.events.diagram.diagramDescriptor.sourceData.source;

        if (source) {
            await navigator.clipboard.writeText(source);
            this.contextMenu.events.diagram.plugin.showNotice('Copied');
        }
    }
}
