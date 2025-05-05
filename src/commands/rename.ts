import { Command } from 'commander'
import { getUniqueFilename } from '../utils'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

export function setupRenameCommand(program: Command) {
  program
    .command('rename <dir>')
    .description('Rename files in directory')
    .requiredOption('-s, --substrings <number>', 'Number of split substrings that should be removed from the beginning of the file name')
    .option('-v, --verbose', 'Show detailed information')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (dir: string, options: any) => {
      try {
        // Validate directory
        if (!fs.existsSync(dir)) {
          console.error(`Error: Directory "${dir}" does not exist`)
          return
        }
        
        // Validate substrings parameter
        const substringCount = parseInt(options.substrings, 10)
        if (isNaN(substringCount) || substringCount < 0) {
          console.error('Error: Substrings must be a positive number')
          return
        }
        
        // Get only files, not directories
        const files = fs.readdirSync(dir).filter(file => 
          fs.statSync(path.join(dir, file)).isFile()
        )
        
        // Create a list of planned renames for preview
        const renameOperations = []
        let skippedCount = 0
        
        for (const file of files) {
          const substrings = file.split(/[-_]+/)
          
          if (substrings.length > substringCount) {
            substrings.splice(0, substringCount)
          } else {
            substrings.splice(0, substrings.length-1)
          }
    
          const newName = substrings.join('_')
          
          // Check for duplicates and get a unique name
          const uniqueName = getUniqueFilename(dir, newName)
          
          // Add to our operations list
          renameOperations.push({
            originalFile: file,
            newFile: uniqueName,
            isConflictResolved: uniqueName !== newName
          })
        }
        
        // If no files to rename, exit early
        if (renameOperations.length === 0) {
          console.log('No files to rename in the specified directory.')
          return
        }
        
        // Preview the rename operations
        console.log('\nFiles to be renamed:')
        renameOperations.forEach((op, index) => {
          const conflictNote = op.isConflictResolved ? ' (renamed to avoid conflict)' : ''
          console.log(`${index + 1}. ${op.originalFile} → ${op.newFile}${conflictNote}`)
        })
        
        // Skip confirmation if --yes flag is provided
        if (!options.yes) {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          
          const answer = await new Promise<string>(resolve => {
            rl.question('\nAre you sure you want to continue with these renames? (y/N): ', resolve)
          })
          
          rl.close()
          
          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('Operation cancelled. No files were renamed.')
            return
          }
        }
        
        // Perform the actual renames
        let successCount = 0
        for (const op of renameOperations) {
          try {
            fs.renameSync(path.join(dir, op.originalFile), path.join(dir, op.newFile))
            successCount++
            
            if (options.verbose) {
              const conflictNote = op.isConflictResolved ? ' (renamed to avoid conflict)' : ''
              console.log(`Renamed: ${op.originalFile} → ${op.newFile}${conflictNote}`)
            }
          } catch (error) {
            console.error(`Failed to rename ${op.originalFile}: ${error}`)
            skippedCount++
          }
        }
        
        // Show final summary
        console.log(`\nSummary: Renamed ${successCount} files, skipped ${skippedCount} files`)
        
      } catch (err) {
        console.error(`Error: ${err}`)
        process.exit(1)
      }
    })
}