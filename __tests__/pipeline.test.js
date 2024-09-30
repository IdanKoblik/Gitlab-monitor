const { eventHandler } = require('../endpoints/pipeline');

describe('eventHandler', () => {
    it('should handle a successful pipeline event', async () => {
        const payload = {
            object_attributes: {
                status: 'success',
                iid: 123,
                url: 'http://example.com/pipeline/123',
                builds: []
            },
            user: {
                username: 'testuser',
                email: 'test@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            url: 'http://example.com/pipeline/123',
            title: 'Pipeline `#123` succeeded',
            description: ''
        });
    });

    it('should handle a failed pipeline event with a failure reason', async () => {
        const payload = {
            object_attributes: {
                status: 'failed',
                iid: 456,
                url: 'http://example.com/pipeline/456',
                builds: [
                    { status: 'success' },
                    { status: 'failed', failure_reason: 'Compilation error' }
                ]
            },
            user: {
                username: 'testuser',
                email: 'test@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            url: 'http://example.com/pipeline/456',
            title: 'Pipeline `#456` failed',
            description: 'Compilation error'
        });
    });

    it('should handle a running pipeline event', async () => {
        const payload = {
            object_attributes: {
                status: 'running',
                iid: 789,
                url: 'http://example.com/pipeline/789',
                builds: []
            },
            user: {
                username: 'testuser',
                email: 'test@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            url: 'http://example.com/pipeline/789',
            title: 'Starting pipeline `#789`',
            description: ''
        });
    });

    it('should handle an unknown status', async () => {
        const payload = {
            object_attributes: {
                status: 'unknown',
                iid: 101,
                url: 'http://example.com/pipeline/101',
                builds: []
            },
            user: {
                username: 'testuser',
                email: 'test@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            url: 'http://example.com/pipeline/101',
            title: 'Pipeline `#101` status: unknown',
            description: ''
        });
    });

    it('should handle a canceled pipeline event', async () => {
        const payload = {
            object_attributes: {
                status: 'canceled',
                iid: 102,
                url: 'http://example.com/pipeline/102',
                builds: []
            },
            user: {
                username: 'testuser',
                email: 'test@example.com'
            }
        };

        const result = await eventHandler(payload);

        expect(result).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            url: 'http://example.com/pipeline/102',
            title: 'Pipeline `#102` was canceled',
            description: ''
        });
    });
});
