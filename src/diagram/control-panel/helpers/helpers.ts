import { setIcon, setTooltip } from 'obsidian';

/**
 * Updates an HTML button element with a given icon and/or title
 * @param button the HTML button element to update
 * @param icon the icon to set on the button (optional)
 * @param tooltip the title to set on the button (optional)
 * @returns void
 */
export function updateButton(
    button: HTMLElement,
    icon?: string,
    tooltip?: string
): void {
    if (icon) {
        setIcon(button, icon);
    }
    if (tooltip) {
        setTooltip(button, tooltip);
    }
}
