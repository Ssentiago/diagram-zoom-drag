import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import { LeafID } from '../diagram/state/typing/types';

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
    get leafID(): undefined | string {
        return this.leaf && (this.leaf.id as LeafID);
    }

    /**
     * Determines if the current plugin context is valid.
     *
     * A context is considered valid if both the `leaf` and `view`
     * properties are defined, indicating an active workspace leaf
     * with an associated Markdown view.
     *
     * @returns {boolean} True if the context is valid, otherwise false.
     */
    get isValid(): boolean {
        return this.leaf !== undefined && this.view !== undefined;
    }
}
