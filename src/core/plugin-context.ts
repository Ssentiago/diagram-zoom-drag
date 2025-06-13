import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import { LeafID } from './state';

interface IPluginContext {
    leaf: WorkspaceLeaf | undefined;
    view: MarkdownView | undefined;
    leafID: LeafID | undefined;
}

export class PluginContext implements IPluginContext {
    leaf: WorkspaceLeaf | undefined;
    view: MarkdownView | undefined;

    /**
     * Retrieves the ID of the current workspace leaf.
     *
     * @returns The ID of the workspace leaf as a string if the leaf exists,
     * or `undefined` if no leaf is present.
     */
    get leafID(): undefined | LeafID {
        return this.leaf && (this.leaf.id as LeafID);
    }

    get isActive(): boolean {
        /**
         * Determines if the plugin context is currently active.
         *
         * This method checks if both the workspace leaf and the Markdown view
         * associated with the plugin context are defined. If both are present,
         * it indicates that the plugin context is active.
         *
         * @returns {boolean} `true` if both `leaf` and `view` are defined,
         * otherwise `false`.
         */
        return (
            this.leaf !== undefined &&
            this.view !== undefined &&
            this.view.file !== null
        );
    }
}
