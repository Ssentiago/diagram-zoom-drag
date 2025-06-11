import Diagram, { DiagramDescriptor, FileStats } from './diagram';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { BaseDiagramDescriptor } from '../adapters/markdown-preview-adapter';
import { DiagramSize, SourceData } from '../adapters/base-adapter';

export default class DiagramFactory {
    static createDiagram(
        plugin: DiagramZoomDragPlugin,
        diagramDescriptor: BaseDiagramDescriptor,
        sourceData: SourceData,
        size: DiagramSize,
        fileStats: FileStats,
        container: HTMLElement
    ): Diagram {
        const extendedDiagramDescriptor = {
            ...diagramDescriptor,
            sourceData,
            size,
        } as DiagramDescriptor;
        const diagram = new Diagram(
            plugin,
            container,
            extendedDiagramDescriptor,
            fileStats
        );
        diagram.initialize();
        return diagram;
    }
}
