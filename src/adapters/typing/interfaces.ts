export interface HTMLElementWithCMView extends HTMLElement {
    cmView?: {
        deco?: {
            widget: {
                code: string;
                lineStart: number;
                lineEnd: number;
            };
        };
    };
}
