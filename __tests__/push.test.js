const {eventHandler, MAX_COMMITS_COUNT, EMPTY_COMMIT_SHA} = require('../endpoints/push');

describe('Push Event Handler', () => {
  it('should format push event data correctly', async () => {
    const payload = {
      commits: [
        { id: '1234567890abcdef', title: 'First commit', url: 'http://example.com/commit1' },
        { id: 'abcdef1234567890', title: 'Second commit', url: 'http://example.com/commit2' }
      ],
      ref: 'refs/heads/main',
      repository: { homepage: 'http://example.com' },
      user_username: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      title: 'Pushed to branch `main`',
      url: 'http://example.com/-/tree/main',
      description: expect.stringContaining('1234567') && expect.stringContaining('abcdef1')
    });
  });

  it('should limit the number of commits to MAX_COMMITS_COUNT', async () => {
    const payload = {
      commits: Array(10).fill().map((_, i) => ({
        id: `commit${i}`.padEnd(40, '0'),
        title: `Commit ${i}`,
        url: `http://example.com/commit${i}`
      })),
      ref: 'refs/heads/feature',
      repository: { homepage: 'http://example.com' },
      user_username: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    const commitCount = (result.description.match(/`/g) || []).length / 2;
    expect(commitCount).toBe(MAX_COMMITS_COUNT); 
  });

  it('should handle push events with no commits', async () => {
    const payload = {
      commits: [],
      ref: 'refs/heads/empty',
      repository: { homepage: 'http://example.com' },
      user_username: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      title: 'Pushed to branch `empty`',
      url: 'http://example.com/-/tree/empty',
      description: ''
    });
  });

  it ('handle branch destroying', async () => {
    const payload = {
        commits: [],
        after: EMPTY_COMMIT_SHA,
        ref: 'refs/heads/empty',
        repository: { homepage: 'http://example.com' },
        user_username: 'testuser',
        user_email: 'test@example.com',
        project: { name: 'Test Project' }
      };
  
      const result = await eventHandler(payload);

      expect(result).toEqual({
        title: 'Branch `empty` was destroyed',
        url: '',
        description: ''
      });
  });

  it ('handle branch destroying no commits', async () => {
    const payload = {
        commits: [],
        before: EMPTY_COMMIT_SHA,
        ref: 'refs/heads/empty',
        repository: { homepage: 'http://example.com' },
        user_username: 'testuser',
        user_email: 'test@example.com',
        project: { name: 'Test Project' }
      };
  
      const result = await eventHandler(payload);

      expect(result).toEqual({
        title: 'Branch `empty` was created',
        url: 'http://example.com/-/tree/empty',
        description: ''
      });
  });

  it ('handle branch destroying with commits', async () => {
    const payload = {
        commits: [
            { id: '1234567890abcdef', title: 'First commit', url: 'http://example.com/commit1' },
            { id: 'abcdef1234567890', title: 'Second commit', url: 'http://example.com/commit2' }
        ],
        before: EMPTY_COMMIT_SHA,
        ref: 'refs/heads/new',
        repository: { homepage: 'http://example.com' },
        user_username: 'testuser',
        user_email: 'test@example.com',
        project: { name: 'Test Project' }
      };
  
      const result = await eventHandler(payload);

      expect(result).toEqual({
        title: 'Branch `new` was created',
        url: 'http://example.com/-/tree/new',
        description: expect.stringContaining('1234567') && expect.stringContaining('abcdef1')
    });
  });
});