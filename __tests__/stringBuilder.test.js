const StringBuilder = require('../utils/stringBuilder');

describe('StringBuilder', () => {
    let sb;

    beforeEach(() => {
        sb = new StringBuilder();
    });

    it('should initialize with an empty strings array', () => {
        expect(sb.strings).toEqual([]);
    });

    it('should append strings correctly', () => {
        sb.append('Hello');
        expect(sb.strings).toEqual(['Hello']);

        sb.append(' World');
        expect(sb.strings).toEqual(['Hello', ' World']);
    });

    it('should return the correct concatenated string', () => {
        sb.append('Hello').append(' World');
        expect(sb.toString()).toBe('Hello World');
    });

    it('should return an empty string when no strings are appended', () => {
        expect(sb.toString()).toBe('');
    });

    it('should allow chaining of append calls', () => {
        const result = sb.append('Hello').append(' World').toString();
        expect(result).toBe('Hello World');
    });
});
