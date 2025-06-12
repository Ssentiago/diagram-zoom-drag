import { execSync } from 'node:child_process';
import fs from 'node:fs';
import semver from 'semver';
import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

const MANIFEST_PATH = 'manifest.json';
const PACKAGE_PATH = 'package.json';
const README_PATH = 'README.md';
const CHANGELOG_PATH = 'CHANGELOG.md';

interface JsonFile {
    version: string;
}

/**
 * Reads a JSON file, updates its "version" property, and writes it back.
 *
 * @param jsonPath - Path to the JSON file to be updated.
 * @param release - New version number to be written.
 *
 * @throws If there is an error reading the JSON file, it will be logged to console
 *          and the process will exit with code 1.
 */
function changeReleaseInJson(jsonPath: string, release: string) {
    try {
        const json = fs.readFileSync(jsonPath, 'utf8');
        const data: JsonFile = JSON.parse(json);
        data.version = release;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    } catch (err: any) {
        console.error('Error reading JSON file:', err);
        process.exit(1);
    }
}

/**
 * Runs a sequence of Git commands to commit and tag a new plugin version.
 *
 * @param RELEASE_VERSION - New version number to be written.
 * @param branch - Name of the Git branch to commit to.
 *
 * @throws If any of the Git commands fail, the error will be logged to console
 *          and the process will exit with code 1.
 */
async function performGitCommands(RELEASE_VERSION: string, branch: string) {
    try {
        execSync('git reset', { stdio: 'ignore' });
        execSync(`git add ${PACKAGE_PATH} ${MANIFEST_PATH}`, {
            stdio: 'ignore',
        });
        execSync(`git commit -m 'chore: update plugin version'`, {
            stdio: 'ignore',
        });
        execSync('git push', { stdio: 'ignore' });
        execSync(`git tag ${RELEASE_VERSION}`, { stdio: 'ignore' });
        execSync(`git push origin ${branch} ${RELEASE_VERSION}`, {
            stdio: 'ignore',
        });
    } catch (error) {
        console.error('An error occurred during git operations:', error);
        process.exit(1);
    }
}

/**
 * Asks the user to enter a new version number. It validates the input value
 * by checking if it is a valid semantic versioning format, if it already exists
 * in the previous versions, and if it is greater than the current version.
 *
 * @param previousVersions - An array of strings representing the previous version numbers.
 * @param currentVersion - The current version number as a string.
 * @param isFirstEnter - A boolean indicating if this is the first time the user is asked to enter a new version number.
 * @returns A Promise that resolves with the new version number as a string.
 */
async function getNewVersion(
    previousVersions: string[],
    currentVersion: string,
    isFirstEnter: boolean
) {
    const answer = await input({
        message: 'Enter new version number or press Enter to exit: ',
        required: false,
        validate: (value) => {
            if (value === '') {
                return true;
            }
            if (!semver.valid(value)) {
                return 'Invalid version format. Please try again. It should be semantic versioning (e.g., 1.2.3)';
            }
            if (previousVersions.includes(value)) {
                return 'Version already exists. Please try again.';
            }
            if (!isFirstEnter && semver.lt(value, currentVersion)) {
                return `Version must be greater than current version. Current version is: ${currentVersion}. Please try again.`;
            }
            return true;
        },
    });

    if (!answer.trim()) {
        process.exit(0);
    }

    return answer;
}

/**
 * Presents a menu to the user to update the current version.
 *
 * It offers the following options:
 * - Patch (bug fixes)
 * - Minor (new functionality)
 * - Major (significant changes)
 * - Manual update (enter version)
 * - View previous versions
 * - Exit
 *
 * The function will return the new version number as a string.
 *
 * @param previousVersions - An array of strings representing the previous version numbers.
 * @param currentVersion - The current version number as a string.
 *
 * @returns A Promise that resolves with the new version number as a string.
 */
async function versionMenu(
    previousVersions: string[],
    currentVersion: string
): Promise<string> {
    process.on('SIGINT', () => {
        process.exit(0);
    });

    while (true) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);

        const answer = await select({
            message: `Update current version ${currentVersion} or perform other actions:`,
            choices: [
                {
                    name: `Patch (bug fixes): ${major}.${minor}.${patch + 1}`,
                    value: '1',
                },
                {
                    name: `Minor (new functionality): ${major}.${minor + 1}.0`,
                    value: '2',
                },
                {
                    name: `Major (significant changes): ${major + 1}.0.0`,
                    value: '3',
                },
                { name: 'Manual update (enter version)', value: '4' },
                { name: 'View previous versions', value: '5' },
                { name: 'Exit', value: '6' },
            ],
        });

        if (answer === '1') {
            return `${major}.${minor}.${patch + 1}`;
        } else if (answer === '2') {
            return `${major}.${minor + 1}.0`;
        } else if (answer === '3') {
            return `${major + 1}.0.0`;
        } else if (answer === '4') {
            return getNewVersion(previousVersions, currentVersion, false);
        } else if (answer === '5') {
            await input({
                message: 'Press Enter to go back to the menu...',
                required: false,
                transformer: () => '',
            });
        } else if (answer === '6') {
            process.exit(0);
        }
    }
}

/**
 * Get the new version of the plugin. If there are no tags, it asks the user to choose the new
 * version. Otherwise, it shows a version menu
 * or pick a new version by entering a number.
 *
 * @returns The new version of the plugin.
 */
async function getVersion(): Promise<string> {
    const tagOutput = execSync('git tag', { stdio: 'pipe' }).toString().trim();
    const tags = tagOutput ? tagOutput.split('\n') : [];

    const currentVersion = tags[tags.length - 1];

    if (tags.length === 0) {
        return getNewVersion(tags, currentVersion, true);
    }

    return versionMenu(tags, currentVersion);
}

/**
 * Asynchronously sets the release version by iterating through a loop to handle user input.
 *
 * The function prompts the user to enter a new version number, provides options for confirmation,
 * and executes Git commands to update the plugin version in package.json and manifest.json files.
 *
 * @returns A Promise that resolves when the release process is completed.
 */
async function setRelease() {
    while (true) {
        const RELEASE_VERSION = await getVersion();

        const confirmation = await select({
            message: `You entered version ${RELEASE_VERSION}. Continue?`,
            choices: [
                { name: 'Yes', value: 'y' },
                { name: 'No', value: 'n' },
                { name: 'Retry', value: 'r' },
            ],
        });

        switch (confirmation) {
            case 'y':
                break;
            case 'n':
                process.exit(0);
            case 'r':
                continue;
        }

        changeReleaseInJson(PACKAGE_PATH, RELEASE_VERSION);
        changeReleaseInJson(MANIFEST_PATH, RELEASE_VERSION);

        console.log(
            chalk.green(
                `Version updated to ${RELEASE_VERSION} in package.json and manifest.json`
            )
        );

        const confirmContinue = await confirm({
            message: 'Continue with git operations?',
            default: true,
        });

        if (!confirmContinue) {
            process.exit(0);
        }

        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            stdio: 'pipe',
        })
            .toString()
            .trim();

        while (true) {
            console.log(
                `You are currently on branch ${currentBranch}. The new tag will be created on remote ${currentBranch}.`
            );
            const confirmation = await confirm({
                message: 'Do you want to continue?',
                default: true,
            });

            if (confirmation) {
                break;
            } else {
                process.exit(0);
            }
        }

        await performGitCommands(RELEASE_VERSION, currentBranch);

        console.log(
            chalk.green(
                `Release ${RELEASE_VERSION} has been successfully created and pushed.`
            )
        );
        process.exit(0);
    }
}

setRelease().catch((error) => {
    process.exit(1);
});
