export enum SupportedDiagrams {
    Default = '.diagram-zoom-drag',
    Mermaid = '.mermaid',
    Mehrmaid = '.block-language-mehrmaid',
    PlantUML = '.block-language-plantuml',
    Graphviz = '.block-language-dot',
}

export enum DiagramSelectors {
    Container = '.diagram-container',
    Content = '.diagram-content',
}

export enum TriggerType {
    NONE = 1 << 0,
    MOUSE = 1 << 1, // initiator is the mouse event (hover)
    FOCUS = 1 << 2, // initiator is the focus event (out / in)
    KEYPRESS = 1 << 3, // initiator is the keyboard event
    FOLD = 1 << 4, // initiator is the fold action
    FORCE = 1 << 5, // initiator is the Obsidian plugin command handler
    SERVICE_HIDING = 1 << 6, // initiator is the service hiding button
}
