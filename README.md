# mycli

A command-line interface program for utility function, currently including:
- Batch renaming files by removing substrings from filenames.

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- TypeScript

### Install from source

Clone the repository:

```bash
git clone https://github.com/levistark/mycli.git
cd mycli
npm install
npm run build
npm link
```

### Usage
```bash
mycli rename <directory> -s <number>
```

Where:

<directory> is the path to the directory containing files to rename
-s, --substrings <number> is the number of parts to remove from the beginning of each filename

Examples
If you have files named like:

project-123-document.pdf
project-456-report.docx

And you want to remove the first two parts ("project" and the ID number):
```bash
mycli rename ./documents -s 2
```

This would rename them to:

document.pdf
report.docx

Options

```bash
-s, --substrings <number>: Number of split substrings to remove (required)
-v, --verbose: Show detailed information about each rename operation
-y, --yes: Skip confirmation prompt and rename immediately
```

How It Works
The tool:

Splits filenames by hyphens and underscores
Removes the specified number of parts from the beginning
Joins the remaining parts with underscores
Handles filename conflicts by adding numbers (_1, _2, etc.)
Shows a preview and confirmation prompt before making changes