import Diagram from './diagram';
import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { DiagramData } from '../settings/typing/interfaces';

export default class DiagramFactory {
    static createDiagram(
        plugin: DiagramZoomDragPlugin,
        diagramData: DiagramData,
        container: HTMLElement
    ): Diagram {
        return new Diagram(plugin, container, diagramData);
    }
}
