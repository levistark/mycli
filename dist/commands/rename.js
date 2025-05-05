"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRenameCommand = setupRenameCommand;
const utils_1 = require("../utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
function setupRenameCommand(program) {
    program
        .command('rename <dir>')
        .description('Rename files in directory')
        .requiredOption('-s, --substrings <number>', 'Number of split substrings that should be removed from the beginning of the file name')
        .option('-v, --verbose', 'Show detailed information')
        .option('-y, --yes', 'Skip confirmation prompt')
        .action(async (dir, options) => {
        try {
            // Validate directory
            if (!fs_1.default.existsSync(dir)) {
                console.error(`Error: Directory "${dir}" does not exist`);
                return;
            }
            // Validate substrings parameter
            const substringCount = parseInt(options.substrings, 10);
            if (isNaN(substringCount) || substringCount < 0) {
                console.error('Error: Substrings must be a positive number');
                return;
            }
            // Get only files, not directories
            const files = fs_1.default.readdirSync(dir).filter(file => fs_1.default.statSync(path_1.default.join(dir, file)).isFile());
            // Create a list of planned renames for preview
            const renameOperations = [];
            let skippedCount = 0;
            for (const file of files) {
                const substrings = file.split(/[-_]+/);
                if (substrings.length > substringCount) {
                    substrings.splice(0, substringCount);
                }
                else {
                    substrings.splice(0, substrings.length - 1);
                }
                const newName = substrings.join('_');
                // Check for duplicates and get a unique name
                const uniqueName = (0, utils_1.getUniqueFilename)(dir, newName);
                // Add to our operations list
                renameOperations.push({
                    originalFile: file,
                    newFile: uniqueName,
                    isConflictResolved: uniqueName !== newName
                });
            }
            // If no files to rename, exit early
            if (renameOperations.length === 0) {
                console.log('No files to rename in the specified directory.');
                return;
            }
            // Preview the rename operations
            console.log('\nFiles to be renamed:');
            renameOperations.forEach((op, index) => {
                const conflictNote = op.isConflictResolved ? ' (renamed to avoid conflict)' : '';
                console.log(`${index + 1}. ${op.originalFile} → ${op.newFile}${conflictNote}`);
            });
            // Skip confirmation if --yes flag is provided
            if (!options.yes) {
                const rl = readline_1.default.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                const answer = await new Promise(resolve => {
                    rl.question('\nAre you sure you want to continue with these renames? (y/N): ', resolve);
                });
                rl.close();
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    console.log('Operation cancelled. No files were renamed.');
                    return;
                }
            }
            // Perform the actual renames
            let successCount = 0;
            for (const op of renameOperations) {
                try {
                    fs_1.default.renameSync(path_1.default.join(dir, op.originalFile), path_1.default.join(dir, op.newFile));
                    successCount++;
                    if (options.verbose) {
                        const conflictNote = op.isConflictResolved ? ' (renamed to avoid conflict)' : '';
                        console.log(`Renamed: ${op.originalFile} → ${op.newFile}${conflictNote}`);
                    }
                }
                catch (error) {
                    console.error(`Failed to rename ${op.originalFile}: ${error}`);
                    skippedCount++;
                }
            }
            // Show final summary
            console.log(`\nSummary: Renamed ${successCount} files, skipped ${skippedCount} files`);
        }
        catch (err) {
            console.error(`Error: ${err}`);
            process.exit(1);
        }
    });
}
