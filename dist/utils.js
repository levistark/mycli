"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueFilename = getUniqueFilename;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getUniqueFilename(directory, filename) {
    let newName = filename;
    let counter = 1;
    // Keep checking until we find a filename that doesn't exist
    while (fs_1.default.existsSync(path_1.default.join(directory, newName))) {
        // Skip if it's the same file (case-sensitive filesystems)
        const originalStats = fs_1.default.statSync(path_1.default.join(directory, filename));
        const existingStats = fs_1.default.statSync(path_1.default.join(directory, newName));
        // If it's the same file (identical inode), we can use this name
        if (originalStats.ino === existingStats.ino) {
            break;
        }
        // Create a new name with counter
        newName = `${counter}_${filename}`;
        counter++;
    }
    console.log('New name will be: ', newName);
    return newName;
}
