import { spawn } from 'child_process';
import { promises as fs } from 'node:fs';
import * as process from 'node:process';
import psList from 'ps-list';
import { run } from 'node:test';

/**
 * Checks if Obsidian is currently running.
 *
 * @returns A promise that resolves to `true` if Obsidian is running, `false` otherwise.
 */
async function isObsidianRunning() {
    const processes = await psList();
    return processes.some((p) => p.name.toLowerCase().includes('obsidian'));
}

/**
 * Starts Obsidian in debugging mode at port 9222.
 *
 * @param obsidianPath - The path to the Obsidian executable.
 *
 * @returns A promise that resolves when Obsidian has been started.
 */
async function startObsidian() {
    const isRunning = await isObsidianRunning();
    if (isRunning) {
        console.log('Obsidian is already running.');
        return;
    }

    const cp = spawn(
        'flatpak',
        ['run', 'md.obsidian.Obsidian', '--remote-debugging-port=9222'],
        {
            detached: true,
            stdio: 'ignore',
        }
    );

    cp.unref();
    console.log('Obsidian started in debugging mode at port 9222.');
}

startObsidian().catch((err) => {
    console.error('Error starting Obsidian:', err);
    process.exit(1);
});
