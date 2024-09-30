const { eventHandler } = require('../endpoints/release');

describe('eventHandler', () => {
    it('should return the correct structure for a valid payload', async () => {
        const payload = {
            commit: {
                author: {
                    email: 'author@example.com',
                    name: 'Author Name'
                }
            },
            description: 'This is a test release.',
            action: 'create',
            url: 'https://example.com/release/1',
            name: 'Test Release',
            assets: {
                sources: [{ format: 'zip', url: 'https://example.com/source.zip' }],
                links: [{ name: 'Documentation', url: 'https://example.com/docs' }]
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'Author Name',
            email: 'author@example.com',
            url: 'https://example.com/release/1',
            description: 'This is a test release.',
            title: 'Created release `Test Release`',
            fields: [
                { name: 'Sources', value: '[zip](https://example.com/source.zip)', inline: true },
                { name: 'Links', value: '[Documentation](https://example.com/docs)', inline: true },
            ]
        });
    });

    it('should handle cases with no sources and links', async () => {
        const payload = {
            commit: {
                author: {
                    email: 'author@example.com',
                    name: 'Author Name'
                }
            },
            description: 'This is a test release.',
            action: 'create',
            url: 'https://example.com/release/1',
            name: 'Test Release',
            assets: {
                sources: [],
                links: []
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'Author Name',
            email: 'author@example.com',
            url: 'https://example.com/release/1',
            description: 'This is a test release.',
            title: 'Created release `Test Release`',
            fields: [
                { name: 'Sources', value: 'None', inline: true },
                { name: 'Links', value: 'None', inline: true },
            ]
        });
    });

    it('should capitalize the action correctly', async () => {
        const payload = {
            commit: {
                author: {
                    email: 'author@example.com',
                    name: 'Author Name'
                }
            },
            description: 'This is a test release.',
            action: 'update',
            url: 'https://example.com/release/2',
            name: 'Another Release',
            assets: {
                sources: [],
                links: []
            }
        };

        const result = await eventHandler(payload);

        expect(result.title).toBe('Updated release `Another Release`');
    });

    it('should handle payloads with special characters in the name', async () => {
        const payload = {
            commit: {
                author: {
                    email: 'author@example.com',
                    name: 'Author Name'
                }
            },
            description: 'This is a test release.',
            action: 'create',
            url: 'https://example.com/release/3',
            name: 'Release & Test',
            assets: {
                sources: [],
                links: []
            }
        };

        const result = await eventHandler(payload);

        expect(result.title).toBe('Created release `Release & Test`');
    });
});
