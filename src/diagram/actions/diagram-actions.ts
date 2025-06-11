import Diagram from '../diagram';
import { DiagramSelectors } from '../typing/constants';

export class DiagramActions {
    constructor(public diagram: Diagram) {}

    /**
     * Moves the diagram element in the given container by the given dx and dy
     * amounts. If setAnimation is true, the element will be animated to its
     * new position. Otherwise, the element will be positioned immediately.
     * @param container - The container element that contains the diagram
     * element.
     * @param dx - The horizontal distance to move the element.
     * @param dy - The vertical distance to move the element.
     * @param setAnimation - Whether to animate the movement of the element. Defaults to undefined.
     */
    moveElement(dx: number, dy: number, setAnimation?: boolean): void {
        const element: HTMLElement | null =
            this.diagram.container.querySelector(DiagramSelectors.Content);
        if (!element) {
            return;
        }

        this.diagram.dx += dx;
        this.diagram.dy += dy;
        element.setCssStyles({
            transition: setAnimation ? 'transform 0.3s ease-out' : 'none',
            transform: `translate(${this.diagram.dx}px, ${this.diagram.dy}px) scale(${this.diagram.scale})`,
        });

        if (setAnimation) {
            this.diagram.plugin.context.view!.registerDomEvent(
                element,
                'transitionend',
                () => {
                    element.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }

    /**
     * Zooms the diagram element in the given container by the given factor.
     * If setAnimation is true, the element will be animated to its new scale.
     * Otherwise, the element will be scaled immediately.
     * @param container - The container element that contains the diagram
     * element.
     * @param factor - The zoom factor. For example, 1.5 means 150% scale.
     * @param setAnimation - Whether to animate the zooming of the element. Defaults to undefined.
     */
    zoomElement(factor: number, setAnimation?: boolean): void {
        const element: HTMLElement | null =
            this.diagram.container.querySelector(DiagramSelectors.Content);

        if (!element) {
            return;
        }

        const containerRect = this.diagram.container.getBoundingClientRect();

        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const offsetX = (centerX - this.diagram.dx) / this.diagram.scale;
        const offsetY = (centerY - this.diagram.dy) / this.diagram.scale;

        this.diagram.scale *= factor;
        this.diagram.scale = Math.max(0.125, this.diagram.scale);

        this.diagram.dx = centerX - offsetX * this.diagram.scale;
        this.diagram.dy = centerY - offsetY * this.diagram.scale;

        element.setCssStyles({
            transition: setAnimation
                ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                : 'none',
            transform: `translate(${this.diagram.dx}px, ${this.diagram.dy}px) scale(${this.diagram.scale})`,
        });
        if (setAnimation) {
            this.diagram.plugin.context.view!.registerDomEvent(
                element,
                'transitionend',
                () => {
                    element.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }

    /**
     * Resets the zoom and move state of the diagram element in the given container to its
     * original state. If setAnimation is true, the element will be animated to its original state.
     * Otherwise, the element will be reset immediately.
     * @param container - The container element that contains the diagram element.
     * @param setAnimation - Whether to animate the reset of the element. Defaults to undefined.
     */
    resetZoomAndMove(setAnimation?: boolean): void {
        const element: HTMLElement | null =
            this.diagram.container.querySelector(DiagramSelectors.Content);
        if (element) {
            this.fitToContainer(element, this.diagram.container, setAnimation);
        }
    }

    /**
     * Fits the diagram element to its container element. The element will be scaled to fit within its container while maintaining its aspect ratio.
     * If setAnimation is true, the element will be animated to its new position and scale. Otherwise, the element will be positioned and scaled immediately.
     * @param element - The diagram element to be fitted.
     * @param container - The container element that contains the diagram element.
     * @param setAnimation - Whether to animate the fitting of the element. Defaults to undefined.
     */
    fitToContainer(
        element: HTMLElement,
        container: HTMLElement,
        setAnimation?: boolean
    ): void {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const diagramWidth = element.clientWidth;
        const diagramHeight = element.clientHeight;

        this.diagram.scale = Math.min(
            containerWidth / diagramWidth,
            containerHeight / diagramHeight,
            1
        );
        this.diagram.dx =
            (containerWidth - diagramWidth * this.diagram.scale) / 2;
        this.diagram.dy =
            (containerHeight - diagramHeight * this.diagram.scale) / 2;

        element.setCssStyles({
            transition: setAnimation
                ? 'transform 0.3s cubic-bezier(0.42, 0, 0.58, 1)'
                : 'none',
            transform: `translate(${this.diagram.dx}px, ${this.diagram.dy}px) scale(${this.diagram.scale})`,
            transformOrigin: 'top left',
        });
        if (setAnimation) {
            this.diagram.plugin.context.view!.registerDomEvent(
                element,
                'transitionend',
                () => {
                    element.setCssStyles({
                        transition: 'none',
                    });
                },
                { once: true }
            );
        }
    }
}
