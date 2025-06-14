import {
    DebugLevel,
    DefaultSettings,
    DimensionSetting,
    PanelsTriggering,
} from '../typing/interfaces';
import { DimensionUnit } from '../typing/types';

export class MigrateFrom_5_2_0_To_5_3_0 {
    constructor(private settingsManager: any) {}

    private readonly MAP = {
        diagramsPerPage: 'diagrams.settingsPagination.perPage',
        foldByDefault: 'diagrams.folding.foldByDefault',
        automaticFoldingOnFocusChange: 'diagrams.folding.autoFoldOnFocusChange',
        supported_diagrams: 'diagrams.supported_diagrams',
        hideOnMouseOutDiagram: {
            target: 'panels.global.triggering.mode',
            transform: (value: boolean) =>
                value ? PanelsTriggering.HOVER : PanelsTriggering.ALWAYS,
        },
        addHidingButton: 'panels.local.panels.service.buttons.hide',
        'panelsConfig.service.enabled': 'panels.local.panels.service.on',
        'panelsConfig.move.enabled': 'panels.local.panels.move.on',
        'panelsConfig.zoom.enabled': 'panels.local.panels.zoom.on',
        diagramExpanded: {
            target: 'diagrams.size.expanded',
            transform: (input: any) => this.migrateDimensionSetting(input),
        },
        diagramFolded: {
            target: 'diagrams.size.folded',
            transform: (input: any) => this.migrateDimensionSetting(input),
        },
    };

    apply(oldSettings: any): DefaultSettings {
        const newSettings = JSON.parse(
            JSON.stringify(this.settingsManager.defaultSettings)
        );

        for (const [oldPath, mapping] of Object.entries(this.MAP)) {
            const oldValue = this.getNestedValue(oldSettings, oldPath);
            if (oldValue === undefined) {
                continue;
            }

            if (typeof mapping === 'string') {
                this.setNestedValue(newSettings, mapping, oldValue);
            } else {
                const transformed = mapping.transform(oldValue);
                this.setNestedValue(newSettings, mapping.target, transformed);
            }
        }

        const oldPanelsConfig = oldSettings.panelsConfig;
        if (oldPanelsConfig) {
            if (oldPanelsConfig.service?.position) {
                newSettings.panels.local.panels.service.position =
                    oldPanelsConfig.service.position;
            }

            if (oldPanelsConfig.move?.position) {
                newSettings.panels.local.panels.move.position =
                    oldPanelsConfig.move.position;
            }

            if (oldPanelsConfig.zoom?.position) {
                newSettings.panels.local.panels.zoom.position =
                    oldPanelsConfig.zoom.position;
            }
        }

        return newSettings;
    }

    private migrateDimensionSetting(input: any): DimensionSetting {
        return {
            width: {
                value: parseInt(input?.width, 10) || 100,
                unit: (input?.widthUnit as DimensionUnit) || 'px',
            },
            height: {
                value: parseInt(input?.height, 10) || 100,
                unit: (input?.heightUnit as DimensionUnit) || 'px',
            },
        };
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    private setNestedValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const last = keys.pop()!;
        const target = keys.reduce((acc, key) => {
            if (!acc[key]) {
                acc[key] = {};
            }
            return acc[key];
        }, obj);
        target[last] = value;
    }
}
