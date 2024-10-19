import { Diagram } from '../diagram';
import { MovePanel } from '../diagram-control-panel/panelType/move';
import { FoldPanel } from '../diagram-control-panel/panelType/fold';
import { ZoomPanel } from '../diagram-control-panel/panelType/zoom';
import { ServicePanel } from '../diagram-control-panel/panelType/service';
import { ContainerID, LeafID } from './typing/types';
import { Data } from './typing/interfaces';

// TODO улучшить общий интерфейс Data
export interface PanelsData {
    panels: {
        move: MovePanel;
        fold: FoldPanel;
        zoom: ZoomPanel;
        service: ServicePanel;
    };
    controlPanel: HTMLElement;
}

export class DiagramState {
    data: Map<LeafID, Data> = new Map();

    constructor(public diagram: Diagram) {
        Object.defineProperties(this.diagram, {
            dx: {
                get: () => this.dx,
                set: (value) => {
                    this.dx = value;
                },
            },
            dy: {
                get: () => this.dy,
                set: (value) => {
                    this.dy = value;
                },
            },
            scale: {
                get: () => this.scale,
                set: (value) => {
                    this.scale = value;
                },
            },
            nativeTouchEventsEnabled: {
                get: () => this.nativeTouchEventsEnabled,
                set: (value) => {
                    this.nativeTouchEventsEnabled = value;
                },
            },
        });
    }

    /**
     * Initializes the view data for the given leaf ID and container ID.
     *
     * If the leaf ID is not already in the `data` map, it will be added with an
     * empty object as its value. Then, the container ID will be added to the
     * leaf's data object with the default view data values.
     *
     * @param leafID - The ID of the leaf to initialize the view data for.
     * @param containerID - The ID of the container to initialize the view data for.
     */
    initializeContainer(leafID: LeafID, containerID: ContainerID): void {
        if (!this.data.get(leafID)) {
            this.data.set(leafID, {});
        }
        const viewData = this.data.get(leafID);
        if (viewData) {
            viewData[containerID] = {
                dx: 0,
                dy: 0,
                scale: 1,
                nativeTouchEventsEnabled: true,
            };
        }
    }

    initializeContainerPanels(
        leafID: LeafID,
        containerID: ContainerID,
        controlPanel: HTMLElement,
        movePanel: MovePanel,
        foldPanel: FoldPanel,
        zoomPanel: ZoomPanel,
        servicePanel: ServicePanel
    ): void {
        if (!this.data.get(leafID)) {
            return;
        }
        const data = this.data.get(leafID);
        if (!data) {
            return;
        }
        data[containerID].controlPanel = controlPanel;
        data[containerID].panels = {
            move: movePanel,
            fold: foldPanel,
            zoom: zoomPanel,
            service: servicePanel,
        };
    }

    get containersPanels(): PanelsData | undefined {
        const data = this.data.get(this.diagram.plugin.leafID!);
        if (!data) {
            return;
        }
        const containerData = data[this.diagram.activeContainer?.id!];

        if (!containerData) {
            return;
        }

        return {
            panels: containerData.panels!,
            controlPanel: containerData.controlPanel!,
        };
    }

    /**
     * Gets the value of the given field from the view data for the active
     * container and leaf.
     *
     * @param field - The field to get the value for.
     * @returns The value of the given field from the view data for the active
     * container and leaf, or `undefined` if no view data is available.
     */
    getData<K extends keyof Data[ContainerID]>(
        field: K
    ): Data[ContainerID][K] | undefined {
        const activeContainer = this.diagram.activeContainer;
        if (!activeContainer) {
            return;
        }
        const leafID = this.diagram.plugin.leafID;
        if (!leafID) {
            return;
        }

        const data = this.data.get(leafID);
        if (data?.[activeContainer.id]) {
            return data[activeContainer.id][field];
        }
    }

    /**
     * Sets the value of the given field in the view data for the active
     * container and leaf.
     *
     * @param field - The field to set the value for.
     * @param value - The value to set for the given field.
     */
    setData<K extends keyof Data[ContainerID]>(
        field: K,
        value: Data[ContainerID][K]
    ): void {
        const activeContainer = this.diagram.activeContainer;
        if (!activeContainer) {
            return;
        }
        const leafID = this.diagram.plugin.leafID;
        if (!leafID) {
            return;
        }
        const viewData = this.data.get(leafID);
        if (viewData?.[activeContainer.id]) {
            viewData[activeContainer.id][field] = value;
        }
    }

    /**
     * Removes the view data associated with the given leaf ID.
     *
     * @param field - The leaf ID of the view data to remove.
     */
    removeData(field: LeafID): void {
        this.data.delete(field);
    }

    /**
     * The horizontal distance from the origin of the active container that the
     * diagram is currently translated. If the view data is not available, this
     * property returns 0.
     */
    get dx(): number {
        return this.getData('dx') ?? 0;
    }

    /**
     * Sets the horizontal distance from the origin of the active container that the
     * diagram is currently translated.
     *
     * @param value - The new horizontal distance from the origin of the active container.
     */
    set dx(value: number) {
        this.setData('dx', value);
    }

    /**
     * The vertical distance from the origin of the active container that the
     * diagram is currently translated. If the view data is not available, this
     * property returns 0.
     */
    get dy(): number {
        return this.getData('dy') ?? 0;
    }

    /**
     * Sets the vertical distance from the origin of the active container that the
     * diagram is currently translated.
     *
     * @param value - The new vertical distance from the origin of the active container.
     */
    set dy(value: number) {
        this.setData('dy', value);
    }

    /**
     * The current zoom factor of the diagram in the active container.
     *
     * If the view data is not available, this property returns 1.
     */
    get scale(): number {
        return this.getData('scale') ?? 1;
    }

    /**
     * Sets the current zoom factor of the diagram in the active container.
     *
     * @param value - The new zoom factor of the diagram in the active container.
     */
    set scale(value: number) {
        this.setData('scale', value);
    }

    /**
     * Whether native touch eventHandlers are currently enabled for the diagram in the
     * active container.
     *
     * If the view data is not available, this property returns `true`.
     */
    get nativeTouchEventsEnabled(): boolean {
        return this.getData('nativeTouchEventsEnabled') ?? true;
    }

    /**
     * Sets whether native touch eventHandlers are currently enabled for the diagram in the
     * active container.
     *
     * @param value - The new value for whether native touch eventHandlers are enabled.
     */
    set nativeTouchEventsEnabled(value: boolean) {
        this.setData('nativeTouchEventsEnabled', value);
    }
}
