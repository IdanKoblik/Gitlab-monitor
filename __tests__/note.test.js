const { eventHandler } = require('../endpoints/note');

describe('eventHandler', () => {
    it('should handle an Issue comment correctly', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'testuser'
            },
            object_attributes: {
                noteable_type: 'Issue',
                note: 'This is a test comment',
                url: 'https://example.com/issue/1'
            },
            issue: {
                iid: 1,
                title: 'Test Issue'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'user@example.com',
            url: 'https://example.com/issue/1',
            title: 'Left a comment on issue `#1 Test Issue`',
            description: 'This is a test comment'
        });
    });

    it('should handle a MergeRequest comment correctly', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'testuser'
            },
            object_attributes: {
                noteable_type: 'MergeRequest',
                note: 'This is a test comment on MR',
                url: 'https://example.com/merge_request/2'
            },
            merge_request: {
                iid: 2,
                title: 'Test Merge Request'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'user@example.com',
            url: 'https://example.com/merge_request/2',
            title: 'Left a comment on merge request `#2 Test Merge Request`',
            description: 'This is a test comment on MR'
        });
    });

    it('should handle unknown noteable_type correctly', async () => {
        const payload = {
            user: {
                email: 'user@example.com',
                username: 'testuser'
            },
            object_attributes: {
                noteable_type: 'Unknown',
                note: 'This is a test comment',
                url: 'https://example.com/unknown'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'user@example.com',
            url: 'https://example.com/unknown',
            title: 'Left a comment on ',
            description: 'This is a test comment'
        });
    });
});