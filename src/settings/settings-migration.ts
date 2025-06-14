import { MigrationResult, DefaultSettings } from './typing/interfaces';
import { MigrateFrom_5_2_0_To_5_3_0 } from './migrations/5.2.0_5.3.0';
import SettingsManager from './settings-manager';

export class SettingsMigration {
    readonly CURRENT_VERSION = '5.3.0';

    constructor(private settingsManager: SettingsManager) {}

    migrate(oldSettings: any): MigrationResult {
        try {
            if (oldSettings?.version === this.CURRENT_VERSION) {
                return {
                    success: true,
                    version: this.CURRENT_VERSION,
                    data: oldSettings,
                };
            }

            let migrated: DefaultSettings;
            const sourceVersion = oldSettings?.version ?? 'unknown';

            if (!oldSettings?.version || oldSettings.version === '5.2.0') {
                const migrator = new MigrateFrom_5_2_0_To_5_3_0(
                    this.settingsManager
                );
                migrated = migrator.apply(oldSettings);
            } else {
                this.settingsManager.plugin.logger.warn(
                    `Unknown settings version: ${sourceVersion}, using defaults`
                );
                migrated = this.settingsManager.defaultSettings;
            }

            if (!this.validateMigrated(migrated)) {
                throw new Error('Migration result validation failed');
            }

            return {
                success: true,
                version: this.CURRENT_VERSION,
                data: migrated,
            };
        } catch (e: any) {
            return {
                success: false,
                version: this.CURRENT_VERSION,
                errors: [
                    `Migration from ${oldSettings?.version ?? 'unknown'} failed: ${e.message}`,
                ],
            };
        }
    }

    private validateMigrated(data: any): data is DefaultSettings {
        return (
            data &&
            typeof data.version === 'string' &&
            data.diagrams &&
            data.panels &&
            data.debug
        );
    }
}
