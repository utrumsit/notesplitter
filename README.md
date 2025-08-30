# Joplin Note Splitter Plugin

A Joplin plugin that splits a single note into multiple notes based on `---` separators, with support for assigning tags and moving notes to specific notebooks.

## Features
- **Splits Notes**: Divides a selected note into multiple notes using `---` as a separator.
- **Custom Titles**: Uses the first line of each block as the title of the new note.
- **Tag Support**: Applies tags specified in `tag: <tag1>, <tag2>, ...` directives (case-insensitive, comma-separated). Creates tags if they don’t exist.
- **Notebook Support**: Moves notes to notebooks specified in `notebook: <name>` directives (case-insensitive). Falls back to the original notebook if the specified one doesn’t exist.
- **Error Handling**: Shows user-friendly error messages for issues like missing notebooks or tag creation failures.
- **Debugging**: Logs detailed information to the Joplin console for troubleshooting (enable debug mode in Joplin settings).

## Installation
1. **Download the Plugin**:
   - Download the latest `.jpl` file from the [Releases](https://github.com/yourusername/joplin-note-splitter/releases) page.
2. **Install in Joplin**:
   - Open Joplin and go to `Tools > Options > Plugins`.
   - Click `Manage Plugins` and select `Install from file`.
   - Choose the downloaded `.jpl` file.
3. **Enable the Plugin**:
   - The plugin will appear in the Joplin command palette as `Split Notes from Current File`.

## Usage
1. Create a note in Joplin with content separated by `---` markers.
2. Each block should start with a title (first line), followed by optional `tag:` and `notebook:` directives, and the note content.
3. Select the note in Joplin.
4. Run the `Split Notes from Current File` command (via `Tools > Plugins` or a keyboard shortcut if assigned).
5. The plugin will create new notes for each block, assign tags, and move them to specified notebooks if applicable.

### Example Note
```markdown
K1
test note
tag: machiavelli
notebook: MyNotebook
---
K2
date: 2025-08-27
# test note 2
---
K3
test note 3

```
**Result**:
- Creates three notes:
  - **K1**: Title = `K1`, Body = `test note`, Tag = `machiavelli`, Notebook = `My Test Notebook` (if it exists, else original notebook).
  - **K2**: Title = `K2`, Body = `date: 2025-08-27\n# test note 2`, no tags, original notebook.
  - **K3**: Title = `K3`, Body = `test note 3`, no tags, original notebook.
- Shows a success message or error dialogs if issues occur (e.g., missing notebook).

## Debugging
- Enable debug mode in Joplin (`Tools > Options > Plugins > Enable plugin debug mode`).
- Open the Joplin console to view detailed logs (e.g., fetched tags, note creation, errors).
- Report issues on the [GitHub Issues](https://github.com/yourusername/joplin-note-splitter/issues) page with console logs and your note content.

## Limitations
- Only processes the first `tag:` and `notebook:` directive in each block.
- Ignores unrecognized directives (e.g., `date:`).
- Does not modify or delete the original note.
- Requires the target notebook to exist for `notebook:` directives.

## Contributing
Contributions are welcome! Please submit bug reports, feature requests, or pull requests via the [GitHub repository](https://github.com/yourusername/joplin-note-splitter).

## License
MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments
Developed for Joplin users who need to split large notes into smaller ones with custom tags and notebooks. Special thanks to the Joplin community for feedback and testing.
