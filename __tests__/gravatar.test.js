const { getGravatarUrl } = require('../utils/gravatar');
const CryptoJS = require('crypto-js');

describe('getGravatarUrl', () => {
    it('should generate a valid Gravatar URL', () => {
        const email = 'user@example.com';
        const size = 200;
        const expectedHash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
        const expectedUrl = `https://www.gravatar.com/avatar/${expectedHash}?s=${size}`;

        expect(getGravatarUrl(email, size)).toBe(expectedUrl);
    });

    it('should trim and lowercase the email', () => {
        const email = ' User@Example.Com ';
        const size = 200;
        const expectedHash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
        const expectedUrl = `https://www.gravatar.com/avatar/${expectedHash}?s=${size}`;

        expect(getGravatarUrl(email, size)).toBe(expectedUrl);
    });

    it('should throw an error if no email is provided', () => {
        expect(() => getGravatarUrl()).toThrow("Email is required");
    });
});
