import 'obsidian';

declare module 'obsidian' {
    interface WorkspaceLeaf {
        id: string;
    }
    interface DataAdapter {
        basePath: string;
    }
}
