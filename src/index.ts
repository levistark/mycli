#!/usr/bin/env node

import { Command } from 'commander'
import { setupRenameCommand } from './commands/rename'

const program = new Command()

program
  .version('1.0.0')
  .description('My TypeScript CLI tool')

setupRenameCommand(program)

program.parse(process.argv)