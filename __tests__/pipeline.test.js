const { eventHandler } = require('../endpoints/pipeline');

describe('eventHandler', () => {
    test('should handle successful pipeline', async () => {
        const payload = {
            object_attributes: {
                status: 'success',
                iid: 42,
                url: 'http://example.com/pipeline/42',
                duration: 120,
                builds: [],
                ref: 'main'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/42',
            title: 'Pipeline `#42` succeeded',
            description: '',
            fields: [
                { name: 'Source', value: 'main', inline: true },
                { name: 'Duration', value: '120 seconds', inline: true }
            ]
        });
    });

    test('should handle failed pipeline with failure reason', async () => {
        const payload = {
            object_attributes: {
                status: 'failed',
                iid: 43,
                url: 'http://example.com/pipeline/43',
                duration: 60,
                builds: [{ status: 'failed', failure_reason: 'Syntax error' }],
                ref: 'develop'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/43',
            title: 'Pipeline `#43` failed',
            description: 'Syntax error',
            fields: [
                { name: 'Source', value: 'develop', inline: true },
                { name: 'Duration', value: '60 seconds', inline: true }
            ]
        });
    });

    test('should handle running pipeline', async () => {
        const payload = {
            object_attributes: {
                status: 'running',
                iid: 44,
                url: 'http://example.com/pipeline/44',
                duration: 0,
                builds: [],
                ref: 'feature'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/44',
            title: 'Starting pipeline `#44`',
            description: '',
            fields: [
                { name: 'Source', value: 'feature', inline: true },
                { name: 'Duration', value: '0 seconds', inline: true }
            ]
        });
    });

    test('should handle pending pipeline', async () => {
        const payload = {
            object_attributes: {
                status: 'pending',
                iid: 45,
                url: 'http://example.com/pipeline/45',
                duration: 0,
                builds: [],
                ref: 'staging'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/45',
            title: 'Pipeline `#45` is pending',
            description: '',
            fields: [
                { name: 'Source', value: 'staging', inline: true },
                { name: 'Duration', value: '0 seconds', inline: true }
            ]
        });
    });

    test('should handle canceled pipeline', async () => {
        const payload = {
            object_attributes: {
                status: 'canceled',
                iid: 46,
                url: 'http://example.com/pipeline/46',
                duration: 30,
                builds: [],
                ref: 'release'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/46',
            title: 'Pipeline `#46` was canceled',
            description: '',
            fields: [
                { name: 'Source', value: 'release', inline: true },
                { name: 'Duration', value: '30 seconds', inline: true }
            ]
        });
    });

    test('should handle unknown status', async () => {
        const payload = {
            object_attributes: {
                status: 'unknown',
                iid: 47,
                url: 'http://example.com/pipeline/47',
                duration: 45,
                builds: [],
                ref: 'unknown'
            },
            user: {
                username: 'testuser',
                email: 'testuser@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser@example.com',
            url: 'http://example.com/pipeline/47',
            title: 'Pipeline `#47` status: unknown',
            description: '',
            fields: [
                { name: 'Source', value: 'unknown', inline: true },
                { name: 'Duration', value: '45 seconds', inline: true }
            ]
        });
    });
});
