import { updateButton } from '../helpers/helpers';
import Diagram from '../../diagram';
import { ControlPanel, TriggerType } from '../control-panel';
import { PanelsTriggering } from '../../../settings/typing/interfaces';

export abstract class BasePanel {
    protected panel: HTMLElement | null = null;

    constructor(protected controlPanel: ControlPanel) {}

    abstract get enabled(): boolean;
    protected abstract createPanel(): void;

    get diagram() {
        return this.controlPanel.diagram;
    }

    initialize(): void {
        if (!this.enabled) {
            return;
        }

        this.panel = this.createPanelElement();
        this.createPanel();
        this.updateVisibility();
    }

    protected createPanelElement(): HTMLElement {
        const controlPanel = this.controlPanel.controlPanel;
        const panel = controlPanel.createEl('div');
        panel.addClass(this.cssClass);
        panel.addClass('diagram-zoom-drag-panel');
        panel.setCssStyles(this.cssStyles);
        return panel;
    }

    protected createButton(
        icon: string,
        action: () => void,
        title: string,
        active = true,
        id: string | undefined = undefined
    ) {
        const button = document.createElement('button');
        button.className = 'button';
        button.id = id ?? '';

        if (active) {
            button.setCssStyles({
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background-color 0.2s ease',
            });

            updateButton(button, icon, title);

            this.controlPanel.diagram.plugin.context.view!.registerDomEvent(
                button,
                'click',
                action
            );

            this.controlPanel.diagram.plugin.context.view!.registerDomEvent(
                button,
                'mouseenter',
                () => {
                    button.setCssStyles({
                        color: 'var(--interactive-accent)',
                    });
                }
            );

            this.controlPanel.diagram.plugin.context.view!.registerDomEvent(
                button,
                'mouseleave',
                () => {
                    button.setCssStyles({
                        color: 'var(--text-muted)',
                    });
                }
            );
        } else {
            button.setCssStyles({
                visibility: 'hidden',
            });
        }
        return button;
    }

    protected abstract get cssClass(): string;
    protected abstract get cssStyles(): object;

    updateVisibility(): void {
        if (!this.panel) {
            return;
        }

        const isFolded =
            this.controlPanel.diagram.container.dataset.folded === 'true';

        const trigger = TriggerType.FOLD;

        isFolded ? this.show(trigger) : this.hide(trigger);
    }

    show(triggerType: TriggerType): void {
        if (
            triggerType !== TriggerType.FORCE &&
            !this.shouldRespondToTrigger(triggerType)
        ) {
            return;
        }

        if (!this.panel) return;
        this.panel.removeClass('hidden');
        this.panel.addClass('visible');
    }

    hide(triggerType: TriggerType): void {
        if (
            triggerType !== TriggerType.FORCE &&
            !this.shouldRespondToTrigger(triggerType)
        ) {
            return;
        }

        if (!this.panel) return;
        this.panel.removeClass('visible');
        this.panel.addClass('hidden');
    }

    isVisible() {
        return (
            this.panel?.classList?.contains('visible') &&
            !this.panel.classList.contains('hidden')
        );
    }

    protected shouldRespondToTrigger(triggerType: TriggerType): boolean {
        if (triggerType === TriggerType.FORCE) {
            return true;
        }
        return !!(this.supportedTriggers & triggerType);
    }

    protected get supportedTriggers(): number {
        return (
            TriggerType.FOCUS |
            TriggerType.KEYPRESS |
            TriggerType.FORCE |
            TriggerType.FOLD |
            TriggerType.MOUSE
        );
    }
}
