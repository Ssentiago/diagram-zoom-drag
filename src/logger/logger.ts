import DiagramZoomDragPlugin from '../core/diagram-zoom-drag-plugin';
import { normalizePath, Platform } from 'obsidian';
import { Simulate } from 'react-dom/test-utils';

interface ObsidianAppExtend {
    plugins: {
        enabledPlugins: Set<string>;
    };
}

export default class Logger {
    private maxEntries = 2000;
    private storageKey: string;
    private isStorageAvailable = true;

    constructor(public plugin: DiagramZoomDragPlugin) {
        this.storageKey = `${plugin.manifest.id}-logs`;
        this.checkStorageAvailability();
    }

    async init() {
        this.plugin.settings.data.debug.enabled &&
            (await this.writeSystemInfo());
    }

    async saveLogsToFile(content: string): Promise<void> {
        try {
            const logsDir = '.obsidian/plugins/Diagram Zoom Drag/logs';

            if (!(await this.plugin.app.vault.adapter.exists(logsDir))) {
                await this.plugin.app.vault.adapter.mkdir(logsDir);
            }

            const now = new Date();
            const filename = `logs-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;
            const filepath = `${logsDir}/${filename}`;

            await this.plugin.app.vault.adapter.write(filepath, content);

            await this.rotateLogFiles(logsDir);

            console.log(`Logger: Логи сохранены в ${filepath}`);
        } catch (error) {
            console.error('Logger: Ошибка записи в файл:', error);
        }
    }
    /**
     * Удалить старые лог-файлы
     */
    private async rotateLogFiles(logsDir: string): Promise<void> {
        try {
            const files = await this.plugin.app.vault.adapter.list(logsDir);
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней

            for (const file of files.files) {
                if (!file.endsWith('.json')) {
                    continue;
                }

                const filePath = `${logsDir}/${file}`;
                const stat = await this.plugin.app.vault.adapter.stat(filePath);

                if (stat && now - stat.mtime > maxAge) {
                    await this.plugin.app.vault.adapter.remove(filePath);
                    console.log(`Logger: Удален старый лог-файл ${file}`);
                }
            }
        } catch (error) {
            console.error('Logger: Ошибка ротации логов:', error);
        }
    }

    getObsidianVersion(): string {
        const title = document.title;
        const match = title.match(/Obsidian v([\d.]+)/);
        return match ? match[1] : 'unknown';
    }

    private async writeSystemInfo(): Promise<void> {
        const systemInfo = {
            timestamp: new Date().toISOString(),
            session_start: true,
            obsidian: {
                version: this.getObsidianVersion(),
                title: document.title,
                enabledPlugins_count: (
                    this.plugin.app as any as ObsidianAppExtend
                ).plugins.enabledPlugins.size,
                enabledPlugins_list: Array.from(
                    (this.plugin.app as any as ObsidianAppExtend).plugins
                        .enabledPlugins
                ),
                vault_name: this.plugin.app.vault.getName(),
                is_mobile: Platform.isMobile,
                is_desktop: Platform.isDesktopApp,
            },
            system: {
                platform: this.getPlatformInfo(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                online_status: navigator.onLine,
                cpu_cores: navigator.hardwareConcurrency || 'unknown',
                device_memory: (navigator as any).deviceMemory || 'unknown',
                connection_type:
                    (navigator as any).connection?.effectiveType || 'unknown',
            },
            plugin: {
                name: this.plugin.manifest.name,
                version: this.plugin.manifest.version,
                minAppVersion: this.plugin.manifest.minAppVersion,
                id: this.plugin.manifest.id,
                author: this.plugin.manifest.author,
                description: this.plugin.manifest.description,
            },
            performance: {
                memory_used:
                    (performance as any).memory?.usedJSHeapSize || 'unknown',
                memory_total:
                    (performance as any).memory?.totalJSHeapSize || 'unknown',
                memory_limit:
                    (performance as any).memory?.jsHeapSizeLimit || 'unknown',
                load_time: performance.now(),
            },
            storage: {
                localStorage_usage: this.getStorageUsage(),
            },
        };

        this.addLogEntry(systemInfo);
    }

    private getPlatformInfo(): string {
        if ('userAgentData' in navigator) {
            const uaData = (navigator as any).userAgentData;
            return uaData.platform || 'unknown';
        }

        return navigator.platform || 'unknown';
    }

    getStorageUsage(): string {
        try {
            const logs = localStorage.getItem(this.storageKey);
            if (!logs) return '0 B';

            const bytes = logs.length + this.storageKey.length;
            return `${(bytes / 1024).toFixed(2)} KB`;
        } catch {
            return 'unknown';
        }
    }
    private checkStorageAvailability(): void {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch {
            this.isStorageAvailable = false;
            console.warn('Diagram Zoom Drag: Localstorage is not available');
        }
    }

    private addLogEntry(logEntry: any): void {
        if (!this.isStorageAvailable) {
            return;
        }

        try {
            const logs = this.getAllLogs();
            logs.push(logEntry);

            if (logs.length > this.maxEntries) {
                logs.splice(0, logs.length - this.maxEntries);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(logs));
        } catch (error) {
            console.error('Logger: Ошибка записи в localStorage:', error);
            this.isStorageAvailable = false;
        }
    }

    private log(level: string, message: string): void {
        if (!this.plugin.settings.data.debug.enabled) {
            return;
        }
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
        };

        this.addLogEntry(logEntry);
    }

    /**
     * Получить все логи из localStorage
     */
    getAllLogs(): any[] {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Получить логи за текущую дату
     */
    getTodayLogs(): any[] {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return this.getAllLogs().filter((log) =>
            log.timestamp?.startsWith(today)
        );
    }

    /**
     * Очистить все логи
     */
    clearAllLogs(): void {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Очистить логи за сегодня
     */
    clearTodayLogs(): void {
        const today = new Date().toISOString().split('T')[0];
        const logs = this.getAllLogs().filter(
            (log) => !log.timestamp?.startsWith(today)
        );
        localStorage.setItem(this.storageKey, JSON.stringify(logs));
    }

    private shouldLog(messageLevel: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevel = this.plugin.settings.data.debug.level;

        const messageLevelIndex = levels.indexOf(messageLevel.toLowerCase());
        const currentLevelIndex = levels.indexOf(currentLevel);

        return messageLevelIndex >= currentLevelIndex;
    }

    debug(message: string): void {
        if (!this.shouldLog('debug')) {
            return;
        }
        this.log('DEBUG', message);
    }

    info(message: string): void {
        if (!this.shouldLog('info')) {
            return;
        }
        this.log('INFO', message);
    }

    warn(message: string): void {
        if (!this.shouldLog('warn')) {
            return;
        }
        this.log('WARNING', message);
    }

    error(message: string): void {
        if (!this.shouldLog('error')) {
            return;
        }

        this.log('ERROR', message);
        this.saveLogsToFile(this.exportLogs()).catch(console.error);
    }

    exportLogs(): string {
        const logs = this.getAllLogs();
        if (logs.length === 0) {
            return '';
        }
        const systemInfo = logs.filter((log) => log.session_start);
        const regularLogs = logs.filter((log) => !log.session_start);

        let result = '=== SYSTEM INFO ===\n';
        systemInfo.forEach((info) => {
            result += JSON.stringify(info, null, 2) + '\n\n';
        });

        result += '\n=== LOGS ===\n';
        regularLogs.forEach((log) => {
            const date = new Date(log.timestamp);
            const time = date.toLocaleTimeString();
            const dateStr = date.toLocaleDateString();

            result += `[${dateStr} ${time}] ${log.level}: ${log.message}\n`;
            result += '\n';
        });

        return result;
    }
}
