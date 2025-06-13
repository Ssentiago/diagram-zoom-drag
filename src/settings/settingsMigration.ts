import { MigrationResult, DefaultSettings } from './typing/interfaces';
import { MigrateFrom_5_2_0_To_5_3_0 } from './migrations/5.2.0_5.3.0';

export class SettingsMigration {
    private static readonly CURRENT_VERSION = '5.3.0';

    static migrate(oldSettings: any): MigrationResult {
        try {
            if (oldSettings?.version === this.CURRENT_VERSION) {
                return { success: true, version: this.CURRENT_VERSION };
            }

            let migrated: DefaultSettings;

            if (!oldSettings?.version) {
                migrated = MigrateFrom_5_2_0_To_5_3_0.apply(oldSettings);
            } else {
                switch (oldSettings.version) {
                    case '5.2.0':
                        migrated =
                            MigrateFrom_5_2_0_To_5_3_0.apply(oldSettings);
                        break;
                }
            }

            return {
                success: true,
                version: this.CURRENT_VERSION,
                data: migrated!,
            };
        } catch (e: any) {
            return {
                success: false,
                version: this.CURRENT_VERSION,
                errors: [`Migration error: ${e.message}`],
            };
        }
    }
}
