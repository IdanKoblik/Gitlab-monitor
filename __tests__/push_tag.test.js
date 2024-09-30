const { eventHandler, MAX_COMMITS_COUNT, EMPTY_COMMIT_SHA } = require('../endpoints/push_tag');

describe('Push Event Handler', () => {
  it('should format push event data correctly for branches', async () => {
    const payload = {
      commits: [
        { id: '1234567890abcdef', title: 'First commit', url: 'http://example.com/commit1' },
        { id: 'abcdef1234567890', title: 'Second commit', url: 'http://example.com/commit2' }
      ],
      email: "test@example.com",
      ref: 'refs/heads/main',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: "test@example.com",
      username: 'testuser',
      title: 'Pushed to branch `main`',
      url: 'http://example.com/-/tree/main',
      description: expect.stringContaining('1234567') && expect.stringContaining('abcdef1')
    });
  });

  it('should format push event data correctly for tags', async () => {
    const payload = {
      commits: [
        { id: '1234567890abcdef', title: 'First tag commit', url: 'http://example.com/tag_commit1' },
        { id: 'abcdef1234567890', title: 'Second tag commit', url: 'http://example.com/tag_commit2' }
      ],
      ref: 'refs/tags/v1.0.0',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: 'test@test.com',
      username: 'testuser',
      title: 'Pushed to tag `v1.0.0`',
      url: 'http://example.com/-/tags/v1.0.0',
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
      email: "test@example.com",
      ref: 'refs/heads/feature',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    const commitCount = (result.description.match(/`/g) || []).length / 2;
    expect(commitCount).toBe(MAX_COMMITS_COUNT);
  });

  it('should handle push events with no commits for branches', async () => {
    const payload = {
      commits: [],
      ref: 'refs/heads/empty',
      email: "test@example.com",
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: "test@example.com",
      username: 'testuser',
      title: 'Pushed to branch `empty`',
      url: 'http://example.com/-/tree/empty',
      description: ''
    });
  });

  it('should handle push events with no commits for tags', async () => {
    const payload = {
      commits: [],
      ref: 'refs/tags/v1.0.0',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      title: 'Pushed to tag `v1.0.0`',
      email: "test@test.com",
      username: "testuser",
      url: 'http://example.com/-/tags/v1.0.0',
      description: ''
    });
  });

  it('should handle branch destroying', async () => {
    const payload = {
      commits: [],
      email: "test@example.com",
      after: EMPTY_COMMIT_SHA,
      ref: 'refs/heads/empty',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      username: 'testuser',
      email: 'test@example.com',
      title: 'Branch `empty` was destroyed',
      url: '',
      description: ''
    });
  });

  it('should handle branch destroying with commits', async () => {
    const payload = {
      commits: [
        { id: '1234567890abcdef', title: 'First commit', url: 'http://example.com/commit1' },
        { id: 'abcdef1234567890', title: 'Second commit', url: 'http://example.com/commit2' }
      ],
      email: "test@example.com",
      before: EMPTY_COMMIT_SHA,
      ref: 'refs/heads/new',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: "test@example.com",
      username: "testuser",
      title: 'Branch `new` was created',
      url: 'http://example.com/-/tree/new',
      description: expect.stringContaining('1234567') && expect.stringContaining('abcdef1')
    });
  });

  it('should handle tag destroying', async () => {
    const payload = {
      commits: [],
      after: EMPTY_COMMIT_SHA,
      ref: 'refs/tags/v1.0.0',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: "test@test.com",
      username: "testuser",
      title: 'Tag `v1.0.0` was destroyed',
      url: '',
      description: ''
    });
  });

  it('should handle tag creating with commits', async () => {
    const payload = {
      commits: [
        { id: '1234567890abcdef', title: 'First tag commit', url: 'http://example.com/tag_commit1' },
        { id: 'abcdef1234567890', title: 'Second tag commit', url: 'http://example.com/tag_commit2' }
      ],
      before: EMPTY_COMMIT_SHA,
      ref: 'refs/tags/v1.0.0',
      repository: { homepage: 'http://example.com' },
      user_name: 'testuser',
      user_email: 'test@example.com',
      project: { name: 'Test Project' }
    };

    const result = await eventHandler(payload);

    expect(result).toEqual({
      email: "test@test.com",
      username: "testuser",
      title: 'Tag `v1.0.0` was created',
      url: 'http://example.com/-/tags/v1.0.0',
      description: expect.stringContaining('1234567') && expect.stringContaining('abcdef1')
    });
  });
});
