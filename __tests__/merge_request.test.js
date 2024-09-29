const { eventHandler } = require('../endpoints/merge_request');

describe('eventHandler', () => {
    it('should handle merge request creation', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'username'
            },
            object_attributes: {
                action: 'create',
                iid: 1,
                title: 'Sample MR',
                url: 'http://example.com/merge_requests/1',
                source_branch: 'feature',
                target_branch: 'main',
                description: 'This is a sample merge request.',
                labels: []
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'username',
            email: 'user@example.com',
            url: 'http://example.com/merge_requests/1',
            title: "Created merge request '#1 Sample MR'",
            fields: [
                { name: "From", value: 'feature', inline: true },
                { name: "To", value: 'main', inline: true },
                { name: 'Labels', value: 'None', inline: true }
            ],
            description: 'This is a sample merge request.'
        });
    });

    it('should handle merge request approval', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'username'
            },
            object_attributes: {
                action: 'approval',
                iid: 2,
                title: 'Sample MR 2',
                url: 'http://example.com/merge_requests/2',
                source_branch: 'feature-2',
                target_branch: 'main',
                description: 'This MR is approved.',
                labels: []
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'username',
            email: 'user@example.com',
            url: 'http://example.com/merge_requests/2',
            title: "Approved merge request '#2 Sample MR 2'",
            fields: [
                { name: "From", value: 'feature-2', inline: true },
                { name: "To", value: 'main', inline: true },
                { name: 'Labels', value: 'None', inline: true }
            ],
            description: 'This MR is approved.'
        });
    });

    it('should handle merge request with labels', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'username'
            },
            object_attributes: {
                action: 'update',
                iid: 3,
                title: 'Sample MR with Labels',
                url: 'http://example.com/merge_requests/3',
                source_branch: 'feature-3',
                target_branch: 'main',
                description: 'This MR has labels.',
                labels: [{ title: 'bug' }, { title: 'urgent' }]
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'username',
            email: 'user@example.com',
            url: 'http://example.com/merge_requests/3',
            title: "Updated merge request '#3 Sample MR with Labels'",
            fields: [
                { name: "From", value: 'feature-3', inline: true },
                { name: "To", value: 'main', inline: true },
                { name: 'Labels', value: 'bug, urgent', inline: true }
            ],
            description: 'This MR has labels.'
        });
    });

    it('should handle merge request with no labels', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'username'
            },
            object_attributes: {
                action: 'close',
                iid: 4,
                title: 'Sample MR with No Labels',
                url: 'http://example.com/merge_requests/4',
                source_branch: 'feature-4',
                target_branch: 'main',
                description: 'This MR has no labels.',
                labels: []
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'username',
            email: 'user@example.com',
            url: 'http://example.com/merge_requests/4',
            title: "Closed merge request '#4 Sample MR with No Labels'",
            fields: [
                { name: "From", value: 'feature-4', inline: true },
                { name: "To", value: 'main', inline: true },
                { name: 'Labels', value: 'None', inline: true }
            ],
            description: 'This MR has no labels.'
        });
    });
});
