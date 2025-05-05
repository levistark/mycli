import path from 'path'
import fs from 'fs'

export function getUniqueFilename(directory: string, filename: string): string {
  let newName = filename
  let counter = 1
  
  // Keep checking until we find a filename that doesn't exist
  while (fs.existsSync(path.join(directory, newName))) {
    // Skip if it's the same file (case-sensitive filesystems)
    const originalStats = fs.statSync(path.join(directory, filename))
    const existingStats = fs.statSync(path.join(directory, newName))
    
    // If it's the same file (identical inode), we can use this name
    if (originalStats.ino === existingStats.ino) {
      break
    }
    
    // Create a new name with counter
    newName = `${counter}_${filename}`
    counter++
  }
  console.log('New name will be: ', newName)
  return newName
}