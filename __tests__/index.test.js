const request = require('supertest');
const { app, maskSensitiveInfo } = require('../index');
const { tokens } = require('../config.json');

jest.setTimeout(10000);

describe('GitLab Webhook Monitor', () => {
    describe('Webhook Authentication', () => {
        it('should reject unauthorized tokens', async () => {
            const response = await request(app)
                .post('/webhook')
                .set('X-Gitlab-Token', 'invalid-token')
                .send({});

            expect(response.statusCode).toBe(401);
            expect(response.text).toBe('Unauthorized');
        });

        it('should accept valid tokens', async () => {
            const validToken = Object.keys(tokens)[0];

            const response = await request(app)
                .post('/webhook')
                .set('X-Gitlab-Token', validToken)
                .send({
                    object_kind: 'push',
                    project: { name: 'Test Project' },
                    user_name: 'Test User'
                });

            expect(response.statusCode).not.toBe(401);
        });
    });

    describe('Sensitive Information Masking', () => {
        it('should mask last 6 characters of tokens', () => {
            const testTokens = [
                'completely_secret_token',
                'short',
                'very_long_token_with_lots_of_characters'
            ];

            const maskedTokens = testTokens.map(maskSensitiveInfo);

            expect(maskedTokens[0]).toBe('completely_secret*******');
            expect(maskedTokens[1]).toBe('short');
            expect(maskedTokens[2]).toBe('very_long_token_with_lots_of_char*******');
        });

        it('should handle undefined or null inputs', () => {
            expect(maskSensitiveInfo(undefined)).toBeUndefined();
            expect(maskSensitiveInfo(null)).toBeNull();
        });
    });

});