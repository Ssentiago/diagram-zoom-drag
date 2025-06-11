import { moment } from 'obsidian';
import { ContextMenu } from '../context-menu';
import { DiagramSelectors } from '../../../../typing/constants';

export class Export {
    constructor(private contextMenu: ContextMenu) {}

    export(): void {
        const container = this.contextMenu.events.diagram.container;
        const element: HTMLElement | null = container.querySelector(
            DiagramSelectors.Content
        );

        if (!element) {
            return;
        }

        const svg = element.querySelector('svg');
        const img = element.querySelector('img');

        if (svg) {
            this.exportSVG(svg);
        } else if (img) {
            this.exportIMG(img);
        } else {
            this.contextMenu.events.diagram.plugin.showNotice(
                "Oops! We couldn't find any elements to export. " +
                    'It seems something is wrong with this diagram?.'
            );
        }
    }

    private exportSVG(svg: SVGElement): void {
        const svgData = new XMLSerializer().serializeToString(svg);
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, svgData], {
            type: 'image/svg+xml;charset=utf-8',
        });
        this.downloadFile(svgBlob, 'svg');
    }
    private exportIMG(img: HTMLImageElement): void {
        fetch(img.src)
            .then((response) => response.blob())
            .then((blob) => {
                this.downloadFile(blob, `png`);
            })
            .catch((error) => {
                this.contextMenu.events.diagram.plugin.showNotice(
                    'Error exporting image'
                );
                console.error('Error exporting image:', error);
            });
    }

    private downloadFile(blob: Blob, extension: string): void {
        const { diagram } = this.contextMenu.events;
        const filename = `dzg_export_${diagram.plugin.context.view?.file?.basename ?? 'diagram'}}_${moment().format('YYYYMMDDHHmmss')}.${extension}`;
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }
}
