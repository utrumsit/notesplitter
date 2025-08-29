import joplin from 'api';

joplin.plugins.register({
    onStart: async function() {
        await joplin.commands.register({
            name: 'splitNotes',
            label: 'Split Notes from Current File',
            iconName: 'fas fa-cut',
            execute: async () => {
                try {
                    const noteId = (await joplin.workspace.selectedNoteIds())[0];
                    if (!noteId) {
                        await joplin.views.dialogs.showMessageBox('Please select a note to split.');
                        return;
                    }

                    const note = await joplin.data.get(['notes', noteId], { fields: ['body', 'parent_id'] });
                    const notebookId = note.parent_id;
                    const noteBlocks = note.body.split('---');

                    // Fetch all tags with pagination
                    const allTags = [];
                    let page = 1;
                    let hasMore = true;
                    while (hasMore) {
                        const response = await joplin.data.get(['tags'], { fields: ['id', 'title'], page: page });
                        allTags.push(...(response.items || []));
                        hasMore = response.has_more;
                        page++;
                    }
                    console.log('Fetched tags:', allTags.map(t => t.title));

                    for (const block of noteBlocks) {
                        const lines = block.trim().split('\n');
                        if (lines.length === 0 || lines[0].trim() === '') {
                            continue;
                        }

                        const title = lines.shift().trim();
                        let body = lines.join('\n');
                        let targetNotebookId = notebookId;
                        let tags = [];

                        // Extract tags
                        const tagRegex = /^tag:(.*)$/im;
                        const tagMatch = body.match(tagRegex);
                        if (tagMatch) {
                            tags = tagMatch[1]
                                .split(',')
                                .map(tag => tag.trim())
                                .filter(tag => tag.length > 0);
                            body = body.replace(tagRegex, '').trim();
                        }

                        // Extract notebook
                        const notebookRegex = /^notebook:(.*)$/im;
                        const notebookMatch = body.match(notebookRegex);
                        if (notebookMatch) {
                            const notebookName = notebookMatch[1].trim();
                            try {
                                const notebooks = await joplin.data.get(['folders'], { fields: ['id', 'title'] });
                                const targetNotebook = notebooks.items.find(n => n.title.toLowerCase() === notebookName.toLowerCase());
                                if (targetNotebook) {
                                    targetNotebookId = targetNotebook.id;
                                } else {
                                    await joplin.views.dialogs.showMessageBox(`Notebook "${notebookName}" not found. Creating note in the original notebook.`);
                                }
                            } catch (e) {
                                await joplin.views.dialogs.showMessageBox(`Could not find notebook "${notebookName}": ${e.message}`);
                            }
                            body = body.replace(notebookRegex, '').trim();
                        }

                        if (!title) {
                            continue;
                        }

                        // Create the new note
                        const newNote = await joplin.data.post(['notes'], null, {
                            title: title,
                            body: body,
                            parent_id: targetNotebookId,
                        });
                        console.log(`Created note: ${title} (ID: ${newNote.id})`);

                        // Assign tags
                        for (const tagName of tags) {
                            try {
                                console.log(`Processing tag: ${tagName}`);
                                // Search for existing tag
                                let tag = allTags.find(t => t.title.toLowerCase() === tagName.toLowerCase());
                                console.log(`Tag "${tagName}" found:`, tag);

                                if (!tag) {
                                    // Try creating the tag
                                    try {
                                        tag = await joplin.data.post(['tags'], null, { title: tagName });
                                        allTags.push({ id: tag.id, title: tagName });
                                        console.log(`Created tag: ${tagName} (ID: ${tag.id})`);
                                    } catch (e) {
                                        if (e.message.includes('already exists')) {
                                            // Refetch all tags with pagination
                                            const retryTags = [];
                                            let retryPage = 1;
                                            let retryHasMore = true;
                                            while (retryHasMore) {
                                                const retryResponse = await joplin.data.get(['tags'], { fields: ['id', 'title'], page: retryPage });
                                                retryTags.push(...(retryResponse.items || []));
                                                retryHasMore = retryResponse.has_more;
                                                retryPage++;
                                            }
                                            console.log('Retried tags:', retryTags.map(t => t.title));
                                            tag = retryTags.find(t => t.title.toLowerCase() === tagName.toLowerCase());
                                            if (tag) {
                                                allTags.push({ id: tag.id, title: tag.title });
                                                console.log(`Found tag after retry: ${tagName} (ID: ${tag.id})`);
                                            }
                                        }
                                        if (!tag) {
                                            console.log(`Failed to create or find tag "${tagName}" for note "${title}": ${e.message}`);
                                            await joplin.views.dialogs.showMessageBox(`Failed to create or find tag "${tagName}" for note "${title}": ${e.message}`);
                                            continue;
                                        }
                                    }
                                }

                                // Assign tag to note
                                await joplin.data.post(['tags', tag.id, 'notes'], null, { id: newNote.id });
                                console.log(`Assigned tag "${tagName}" to note "${title}"`);
                            } catch (e) {
                                console.log(`Error processing tag "${tagName}" for note "${title}": ${e.message}`);
                                await joplin.views.dialogs.showMessageBox(`Error processing tag "${tagName}" for note "${title}": ${e.message}`);
                            }
                        }
                    }

                    await joplin.views.dialogs.showMessageBox('Notes have been split successfully!');

                } catch (e) {
                    console.log('General error:', e.message);
                    await joplin.views.dialogs.showMessageBox(`An error occurred: ${e.message}`);
                }
            },
        });
    },
});
