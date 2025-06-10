import { ContextMenu } from '../context-menu';
import { blob } from 'node:stream/consumers';
import { DiagramSelectors } from '../../../old_diagram/typing/constants';

export class CopyDiagram {
    constructor(private readonly diagramContextMenu: ContextMenu) {}

    async copy(container: HTMLElement) {
        const element: HTMLElement | null = container.querySelector(
            DiagramSelectors.Content
        );

        if (!element) {
            return;
        }

        const svg = element.querySelector('svg');
        const img = element.querySelector('img');

        if (svg) {
            await this.copySvg(svg);
            this.diagramContextMenu.diagram.plugin.showNotice('Copied');
        } else if (img) {
            await this.copyImg(img);
            this.diagramContextMenu.diagram.plugin.showNotice('Copied');
        } else {
            console.error('Neither SVG nor IMG element found in the container');
        }
    }

    private async copyImg(img: HTMLImageElement): Promise<void> {
        fetch(img.src)
            .then((response) => response.blob())
            .then(async (blob) => {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob,
                    }),
                ]);
            })
            .catch((error) => console.error('Error copy image:', error));
    }

    private async copySvg(svg: SVGElement): Promise<void> {
        try {
            svg.focus();
            const svgString = new XMLSerializer().serializeToString(svg);
            await navigator.clipboard.writeText(svgString);
        } catch (error) {
            console.error('Failed to copy SVG:', error);
        }
    }
}
