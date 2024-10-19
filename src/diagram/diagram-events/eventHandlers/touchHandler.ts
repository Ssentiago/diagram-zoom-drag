import DiagramEvents from '../diagram-events';

export class TouchHandler {
    private startX!: number;
    private startY!: number;
    private initialDistance!: number;
    private isDragging = false;
    private isPinching = false;
    constructor(private readonly diagramEvents: DiagramEvents) {}

    initializeTouch(container: HTMLElement): void {
        if (!this.diagramEvents.diagram.plugin.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'touchstart',
            this.touchStart.bind(this, container)
        );
        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'touchmove',
            this.touchMove.bind(this, container)
        );
        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'touchend',
            this.touchEnd.bind(this, container)
        );
        this.diagramEvents.diagram.plugin.view.registerDomEvent(
            container,
            'scroll',
            this.scroll.bind(this, container)
        );
    }

    /**
     * Handles the `touchstart` event on the given container element.
     *
     * If native touch event handling is enabled, this function does nothing.
     *
     * Otherwise, this function sets the active container to the given container,
     * prevents the default behavior of the event, and stops the event from propagating.
     *
     * If there is only one touch point, this function sets the `isDragging` flag to
     * true and records the starting position of the touch.
     *
     * If there are two touch points, this function sets the `isPinching` flag to
     * true and records the initial distance between the two touch points.
     *
     * @param container - The container element that received the touch event.
     * @param e - The `TouchEvent` object that represents the touch event.
     */
    private touchStart(container: HTMLElement, e: TouchEvent): void {
        if (this.diagramEvents.diagram.nativeTouchEventsEnabled) {
            return;
        }
        this.diagramEvents.diagram.activeContainer = container;

        const target = e.target as HTMLElement;
        // we got touch to a button panel - returning
        if (target.closest('.mermaid-zoom-drag-panel')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (e.touches.length === 1) {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            this.isPinching = true;
            this.initialDistance = this.calculateDistance(e.touches);
        }
    }

    /**
     * Handles the `touchmove` event on the given container element.
     *
     * If native touch event handling is enabled, this function does nothing.
     *
     * Otherwise, this function prevents the default behavior of the event
     * and stops the event from propagating. It updates the active container
     * to the given container.
     *
     * If there is one touch point and dragging is enabled, the function
     * calculates the displacement since the last touch position and moves
     * the diagram element by that displacement.
     *
     * If there are two touch points and pinching is enabled, the function
     * calculates the scaling factor based on the change in distance between
     * the touch points and zooms the diagram element by that factor.
     *
     * @param container - The container element that received the touch event.
     * @param e - The `TouchEvent` object that represents the touch event.
     */
    private touchMove(container: HTMLElement, e: TouchEvent): void {
        if (this.diagramEvents.diagram.nativeTouchEventsEnabled) {
            return;
        }
        this.diagramEvents.diagram.activeContainer = container;

        e.preventDefault();
        e.stopPropagation();

        const element: HTMLElement | null = container.querySelector(
            this.diagramEvents.diagram.compoundSelector
        );
        if (!element) {
            return;
        }

        if (this.isDragging && e.touches.length === 1) {
            const dx = e.touches[0].clientX - this.startX;
            const dy = e.touches[0].clientY - this.startY;

            this.diagramEvents.diagram.diagramActions.moveElement(
                container,
                dx,
                dy
            );

            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        } else if (this.isPinching && e.touches.length === 2) {
            const currentDistance = this.calculateDistance(e.touches);
            const factor = currentDistance / this.initialDistance;

            this.diagramEvents.diagram.diagramActions.zoomElement(
                container,
                factor
            );

            this.initialDistance = currentDistance;
        }
    }

    /**
     * Handles the `touchend` event on the given container element.
     *
     * If native touch event handling is enabled, this function does nothing.
     *
     * Otherwise, this function prevents the default behavior of the event
     * and stops the event from propagating. It updates the active container
     * to the given container. It also resets the `isDragging` and `isPinching`
     * flags to false.
     *
     * @param container - The container element that received the touch event.
     * @param e - The `TouchEvent` object that represents the touch event.
     */
    private touchEnd(container: HTMLElement, e: TouchEvent): void {
        if (this.diagramEvents.diagram.nativeTouchEventsEnabled) {
            return;
        }
        this.diagramEvents.diagram.activeContainer = container;

        const target = e.target as HTMLElement;
        // we got touch to a button panel - returning
        if (target.closest('.mermaid-zoom-drag-panel')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        this.isDragging = false;
        this.isPinching = false;
    }

    /**
     * Handles the `scroll` event on the given container element.
     *
     * If native touch event handling is enabled, this function does nothing.
     *
     * Otherwise, this function prevents the default behavior of the event
     * and stops the event from propagating. It updates the active container
     * to the given container.
     *
     * @param container - The container element that received the scroll event.
     * @param e - The `Event` object that represents the scroll event.
     */
    private scroll(container: HTMLElement, e: Event): void {
        if (this.diagramEvents.diagram.nativeTouchEventsEnabled) {
            return;
        }
        this.diagramEvents.diagram.activeContainer = container;

        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Calculates the distance between the two touch points.
     *
     * @param touches - The two touch points.
     * @returns The distance between the two touch points.
     */
    private calculateDistance(touches: TouchList): number {
        const [touch1, touch2] = [touches[0], touches[1]];
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
