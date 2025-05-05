#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const rename_1 = require("./commands/rename");
const program = new commander_1.Command();
program
    .version('1.0.0')
    .description('My TypeScript CLI tool');
(0, rename_1.setupRenameCommand)(program);
program.parse(process.argv);
