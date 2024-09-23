const { eventHandler } = require('../endpoints/issue');

describe('eventHandler', () => {
    const mockPayload = {
        object_attributes: {
            action: 'open',
            iid: 123,
            title: 'Test Issue',
            description: 'This is a test issue',
            url: 'https://gitlab.com/test/issue/123',
            labels: [{ title: 'bug' }, { title: 'feature' }],
        },
        user: {
            email: 'user@example.com',
            username: 'testuser',
        },
        assignees: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
    };

    it('should handle a basic issue payload correctly', async () => {
        const result = await eventHandler(mockPayload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'user@example.com',
            title: 'Opened issue `#123 Test Issue`',
            fields: [
                { name: 'Assignees', value: 'John Doe, Jane Smith', inline: true },
                { name: 'Labels', value: 'bug, feature', inline: false },
            ],
            url: 'https://gitlab.com/test/issue/123',
            description: 'This is a test issue',
        });
    });

    it('should handle an issue with no assignees', async () => {
        const payloadNoAssignees = { ...mockPayload, assignees: [] };
        const result = await eventHandler(payloadNoAssignees);

        expect(result.fields[0]).toEqual({
            name: 'Assignees',
            value: 'None',
            inline: true,
        });
    });

    it('should handle an issue with no labels', async () => {
        const payloadNoLabels = {
            ...mockPayload,
            object_attributes: { ...mockPayload.object_attributes, labels: [] },
        };
        const result = await eventHandler(payloadNoLabels);

        expect(result.fields[1]).toEqual({
            name: 'Labels',
            value: 'None',
            inline: false,
        });
    });

    it('should capitalize the action correctly', async () => {
        const payloadCloseAction = {
            ...mockPayload,
            object_attributes: { ...mockPayload.object_attributes, action: 'close' },
        };
        const result = await eventHandler(payloadCloseAction);

        expect(result.title).toBe('Closed issue `#123 Test Issue`');
    });

    it('should handle missing optional fields', async () => {
        const minimalPayload = {
            object_attributes: {
                action: 'update',
                iid: 456,
                title: 'Minimal Issue',
                description: 'Minimal description',
                url: 'https://gitlab.com/test/issue/456',
            },
            user: {
                email: 'minimal@example.com',
                username: 'minimaluser',
            },
        };

        const result = await eventHandler(minimalPayload);

        expect(result).toEqual({
            username: 'minimaluser',
            email: 'minimal@example.com',
            title: 'Updated issue `#456 Minimal Issue`',
            fields: [
                { name: 'Assignees', value: 'None', inline: true },
                { name: 'Labels', value: 'None', inline: false },
            ],
            url: 'https://gitlab.com/test/issue/456',
            description: 'Minimal description',
        });
    });
});