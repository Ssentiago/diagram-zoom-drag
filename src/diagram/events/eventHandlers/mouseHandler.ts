import Events from '../events';
import { DiagramSelectors } from '../../typing/constants';
import { PanelsTriggering } from '../../../settings/typing/interfaces';

export class MouseHandler {
    private startX!: number;
    private startY!: number;
    private initialX!: number;
    private initialY!: number;
    private isDragging = false;

    constructor(private readonly diagramEvents: Events) {}

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
    initialize(container: HTMLElement): void {
        const diagramElement: HTMLElement | null = container.querySelector(
            DiagramSelectors.Content
        );

        if (!diagramElement) {
            return;
        }

        if (!this.diagramEvents.diagram.plugin.context.view) {
            return;
        }

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'wheel',
            this.wheel.bind(this, container, diagramElement),
            { passive: true }
        );

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mousedown',
            this.mouseDown.bind(this, container, diagramElement)
        );

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mousemove',
            this.mouseMove.bind(this, container, diagramElement)
        );

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseup',
            this.mouseUp.bind(this, container, diagramElement)
        );
        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseleave',
            this.mouseLeave.bind(this, container, diagramElement)
        );

        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseenter',
            this.mouseEnterOnDiagram.bind(this, container)
        );
        this.diagramEvents.diagram.plugin.context.view.registerDomEvent(
            container,
            'mouseleave',
            this.mouseLeaveOutDiagram.bind(this, container)
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

        this.diagramEvents.diagram.activeContainer = container;
        const rect = diagramElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const prevScale = this.diagramEvents.diagram.scale;
        this.diagramEvents.diagram.scale += event.deltaY * -0.001;
        this.diagramEvents.diagram.scale = Math.max(
            0.125,
            this.diagramEvents.diagram.scale
        );

        const dx = offsetX * (1 - this.diagramEvents.diagram.scale / prevScale);
        const dy = offsetY * (1 - this.diagramEvents.diagram.scale / prevScale);

        this.diagramEvents.diagram.dx += dx;
        this.diagramEvents.diagram.dy += dy;

        diagramElement.setCssStyles({
            transform: `translate(${this.diagramEvents.diagram.dx}px, ${this.diagramEvents.diagram.dy}px) scale(${this.diagramEvents.diagram.scale})`,
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

        this.diagramEvents.diagram.activeContainer = container;
        container.focus({ preventScroll: true });
        this.isDragging = true;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.initialX = this.diagramEvents.diagram.dx;
        this.initialY = this.diagramEvents.diagram.dy;
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
        this.diagramEvents.diagram.activeContainer = container;

        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        this.diagramEvents.diagram.dx = this.initialX + dx;
        this.diagramEvents.diagram.dy = this.initialY + dy;
        diagramElement.setCssStyles({
            transform: `translate(${this.diagramEvents.diagram.dx}px, ${this.diagramEvents.diagram.dy}px) scale(${this.diagramEvents.diagram.scale})`,
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
        this.diagramEvents.diagram.activeContainer = container;
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

    /**
     * Handles the mouse enter event for the diagram element when the setting is enabled.
     * If container is in a 'folded' state, this method does nothing.
     * This method shows all panels-management in the diagram when the mouse enters the diagram element.
     *
     * @param container - The container element where the event occurred.
     * @param e - The mouse event that triggered the method.
     */
    private mouseEnterOnDiagram(container: HTMLElement, e: MouseEvent): void {
        if (
            !(
                this.diagramEvents.diagram.plugin.settings.data.panels.global
                    .triggering.mode === PanelsTriggering.HOVER
            )
        ) {
            return;
        }

        if (container.dataset.folded === 'true') {
            return;
        }

        const panelsData = this.diagramEvents.diagram.state.panelsData;
        const servicePanel = this.diagramEvents.diagram.plugin.settings.data
            .panels.global.triggering.ignoreService
            ? []
            : [panelsData.panels!.service.panel];
        const panels = [
            panelsData.panels!.move.panel,
            panelsData.panels!.zoom.panel,
        ].concat(servicePanel);
        if (panelsData?.panels) {
            panels.forEach((panel) => {
                panel.removeClass('hidden');
                panel.addClass('visible');
            });
        }
    }

    /**
     * Handles the mouse leave event for the diagram element when the setting is enabled.
     * If container is in a 'folded' state, this method does nothing.
     * This method hides all panels-management in the diagram when the mouse leaves the diagram element.
     *
     * @param container - The container element where the event occurred.
     * @param e - The mouse event that triggered the method.
     */
    private mouseLeaveOutDiagram(container: HTMLElement, e: MouseEvent): void {
        if (
            !(
                this.diagramEvents.diagram.plugin.settings.data.panels.global
                    .triggering.mode === PanelsTriggering.HOVER
            )
        ) {
            return;
        }

        if (container.dataset.folded === 'true') {
            return;
        }

        const panelsData = this.diagramEvents.diagram.state.panelsData;
        const servicePanel = this.diagramEvents.diagram.plugin.settings.data
            .panels.global.triggering.ignoreService
            ? []
            : [panelsData.panels!.service.panel];
        const panels = [
            panelsData.panels!.move.panel,
            panelsData.panels!.zoom.panel,
        ].concat(servicePanel);
        if (panelsData?.panels) {
            panels.forEach((panel) => {
                panel.removeClass('visible');
                panel.addClass('hidden');
            });
        }
    }
}
