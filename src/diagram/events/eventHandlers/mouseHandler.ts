import Events from '../events';
import { DiagramSelectors } from '../../../old_diagram/typing/constants';
import { PanelsTriggering } from '../../../settings/typing/interfaces';
import { TriggerType } from '../../control-panel/control-panel';

export class MouseHandler {
    private startX!: number;
    private startY!: number;
    private initialX!: number;
    private initialY!: number;
    private isDragging = false;

    constructor(private readonly events: Events) {}

    /**
     * Adds mouse event listeners to the given container element.
     *
     * This function adds the following event listeners to the given container element:
     * - `wheel`: Handles the wheel event for the diagram element, zooming it in or out.
     * - `mousedown`: Handles the start of a mouse drag event for the diagram element.
     * - `mousemove`: Handles the move event for the diagram element, moving it if the drag is in progress.
     * - `mouseup`: Handles the end of a mouse drag event for the diagram element.
     * - `mouseleave`: Handles the leave event for the diagram element, stopping any drag in progress.
     *
     * @param container - The container element to add the mouse event listeners to.
     */
    initialize(): void {
        const { container } = this.events.diagram;
        const diagramElement: HTMLElement | null = container.querySelector(
            DiagramSelectors.Content
        );

        if (!diagramElement) {
            return;
        }

        if (!this.events.diagram.plugin.context.view) {
            return;
        }

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'wheel',
            this.wheel.bind(this, container, diagramElement),
            { passive: true }
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mousedown',
            this.mouseDown.bind(this, container, diagramElement)
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mousemove',
            this.mouseMove.bind(this, container, diagramElement)
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseup',
            this.mouseUp.bind(this, container, diagramElement)
        );
        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseleave',
            this.mouseLeave.bind(this, container, diagramElement)
        );

        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseenter',
            this.mouseEnterOnDiagram.bind(this)
        );
        this.events.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseleave',
            this.mouseLeaveOutDiagram.bind(this)
        );
    }

    /**
     * Handles the wheel event for the diagram element, zooming it in or out.
     *
     * The wheel event is only handled if the Ctrl key is pressed.
     * The zooming is done by changing the scale of the diagram element,
     * and applying a transformation to move the element to the correct
     * position.
     *
     * @param container - The container element.
     * @param diagramElement - The diagram element.
     * @param event - The wheel event.
     */
    private wheel(
        container: HTMLElement,
        diagramElement: HTMLElement,
        event: WheelEvent
    ): void {
        if (!event.ctrlKey && document.fullscreenElement !== container) {
            return;
        }

        const rect = diagramElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const prevScale = this.events.diagram.scale;
        this.events.diagram.scale += event.deltaY * -0.001;
        this.events.diagram.scale = Math.max(0.125, this.events.diagram.scale);

        const dx = offsetX * (1 - this.events.diagram.scale / prevScale);
        const dy = offsetY * (1 - this.events.diagram.scale / prevScale);

        this.events.diagram.dx += dx;
        this.events.diagram.dy += dy;

        diagramElement.setCssStyles({
            transform: `translate(${this.events.diagram.dx}px, ${this.events.diagram.dy}px) scale(${this.events.diagram.scale})`,
        });
    }

    /**
     * Handles the mouse down event for the diagram element.
     * If the left mouse button is clicked, it sets the active container to the given container,
     * focuses on the container, enables dragging, and sets initial positions and cursor style.
     *
     * @param container - The container element where the event occurred.
     * @param diagramElement - The diagram element where the event occurred.
     * @param event - The mouse event that triggered the function.
     */
    private mouseDown(
        container: HTMLElement,
        diagramElement: HTMLElement,
        event: MouseEvent
    ): void {
        if (event.button !== 0) {
            return;
        }

        container.focus({ preventScroll: true });
        this.isDragging = true;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.initialX = this.events.diagram.dx;
        this.initialY = this.events.diagram.dy;
        diagramElement.setCssStyles({
            cursor: 'grabbing',
        });
        event.preventDefault();
    }

    /**
     * Handles the mouse move event for the diagram element.
     * If dragging is active, this method updates the position of the diagram
     * element based on the mouse movement and applies the new transformation
     * to the element's CSS styles.
     *
     * @param container - The container element where the event is occurring.
     * @param diagramElement - The diagram element that is being moved.
     * @param event - The mouse event that triggered the method.
     */
    private mouseMove(
        container: HTMLElement,
        diagramElement: HTMLElement,
        event: MouseEvent
    ): void {
        if (!this.isDragging) {
            return;
        }

        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        this.events.diagram.dx = this.initialX + dx;
        this.events.diagram.dy = this.initialY + dy;
        diagramElement.setCssStyles({
            transform: `translate(${this.events.diagram.dx}px, ${this.events.diagram.dy}px) scale(${this.events.diagram.scale})`,
        });
    }

    /**
     * Handles the mouse up event for the diagram element.
     * If dragging is active, this method resets the dragging state and
     * sets the cursor style to 'grab'.
     *
     * @param container - The container element where the event occurred.
     * @param diagramElement - The diagram element where the event occurred.
     * @param event - The mouse event that triggered the method.
     */
    private mouseUp(
        container: HTMLElement,
        diagramElement: HTMLElement,
        event: MouseEvent
    ): void {
        this.isDragging = false;
        diagramElement.setCssStyles({ cursor: 'grab' });
    }

    /**
     * Handles the mouse leave event for the diagram element.
     * This method simulates a mouse up event when the mouse leaves
     * the diagram element, ensuring any dragging in progress is stopped
     * and the cursor style is reset.
     *
     * @param container - The container element where the event occurred.
     * @param diagramElement - The diagram element where the event occurred.
     * @param event - The mouse event that triggered the method.
     */
    private mouseLeave(
        container: HTMLElement,
        diagramElement: HTMLElement,
        event: MouseEvent
    ): void {
        this.mouseUp(container, diagramElement, event);
    }

    private mouseEnterOnDiagram(e: MouseEvent): void {
        const controlPanel = this.events.diagram.controlPanel;
        controlPanel.show(TriggerType.MOUSE);
    }

    private mouseLeaveOutDiagram(e: MouseEvent): void {
        this.events.diagram.controlPanel.hide(TriggerType.MOUSE);
    }
}
