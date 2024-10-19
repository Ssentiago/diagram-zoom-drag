export interface PanelType {
    initialize(): void;
    getButtons(container: HTMLElement): Array<{
        icon: string;
        action: () => void;
        title: string;
        active?: boolean;
        id?: string;
    }>;
    createPanel(): HTMLElement;
}
