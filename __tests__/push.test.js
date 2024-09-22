const pushHandler = require('../endpoints/push');
const { WebhookClient } = require('discord.js');

jest.mock('discord.js', () => {
    return {
        EmbedBuilder: jest.fn().mockImplementation(() => ({
            setTitle: jest.fn().mockReturnThis(),
            setAuthor: jest.fn().mockReturnThis(),
            setURL: jest.fn().mockReturnThis(),
            setDescription: jest.fn().mockReturnThis(),
            setFooter: jest.fn().mockReturnThis(),
            setColor: jest.fn().mockReturnThis(),
            setTimestamp: jest.fn().mockReturnThis(),
        })),
        WebhookClient: jest.fn().mockImplementation(() => ({
            send: jest.fn(),
        })),
    };
});

describe('pushHandler', () => {
    let webhookClient;

    beforeEach(() => {
        webhookClient = new WebhookClient();
    });

    it('should send an embed with commit information', async () => {
        const payload = {
            object_kind: 'push',
            commits: [
                { title: 'Initial commit', url: 'https://gitlab.com/repo/commit/1', id: 'abcd1234567890' },
                { title: 'Add new feature', url: 'https://gitlab.com/repo/commit/2', id: 'efgh1234567890' },
            ],
            ref: 'refs/heads/main',
            repository: { homepage: 'https://gitlab.com/repo' },
            user_username: 'testuser',
            user_email: 'testuser@example.com', 
            project: { name: 'Test Project' },
        };

        await pushHandler(webhookClient, payload);

        expect(webhookClient.send).toHaveBeenCalled();

        const embedArgs = webhookClient.send.mock.calls[0][0].embeds[0];
        expect(embedArgs).toBeDefined();
        expect(embedArgs.setTitle).toHaveBeenCalledWith('`Pushed to branch main`');
        expect(embedArgs.setAuthor).toHaveBeenCalledWith({ name: 'testuser', iconURL: 'https://www.gravatar.com/avatar/7ec7606c46a14a7ef514d1f1f9038823?s=200' });
        expect(embedArgs.setURL).toHaveBeenCalledWith('https://gitlab.com/repo/-/tree/main');
        expect(embedArgs.setDescription).toHaveBeenCalledWith(
            '[`abcd123`](https://gitlab.com/repo/commit/1) Initial commit\n' +
            '[`efgh123`](https://gitlab.com/repo/commit/2) Add new feature\n'
        );
        expect(embedArgs.setFooter).toHaveBeenCalledWith({ text: 'Test Project' });
        expect(embedArgs.setColor).toHaveBeenCalledWith("#237feb");
        expect(embedArgs.setTimestamp).toHaveBeenCalled();
    });

    it('should handle more than 5 commits by limiting to 5', async () => {
        const payload = {
            object_kind: 'push',
            commits: Array.from({ length: 10 }, (_, i) => ({
                title: `Commit ${i + 1}`,
                url: `https://gitlab.com/repo/commit/${i + 1}`,
                id: `id${i + 1}abcdefgh`,
            })),
            ref: 'refs/heads/main',
            repository: { homepage: 'https://gitlab.com/repo' },
            user_username: 'testuser',
            user_email: 'testuser@example.com', 
            project: { name: 'Test Project' },
        };

        await pushHandler(webhookClient, payload);

        const embedArgs = webhookClient.send.mock.calls[0][0].embeds[0];
        expect(embedArgs.setDescription).toHaveBeenCalledWith(
            '[`id1abcd`](https://gitlab.com/repo/commit/1) Commit 1\n' +
            '[`id2abcd`](https://gitlab.com/repo/commit/2) Commit 2\n' +
            '[`id3abcd`](https://gitlab.com/repo/commit/3) Commit 3\n' +
            '[`id4abcd`](https://gitlab.com/repo/commit/4) Commit 4\n' +
            '[`id5abcd`](https://gitlab.com/repo/commit/5) Commit 5\n'
        );
    });
});
