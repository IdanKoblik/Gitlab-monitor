const CryptoJS = require('crypto-js');

function getGravatarUrl(email, size = 200) {
    if (!email) 
        throw new Error("Email is required");

    const trimmedEmail = email.trim().toLowerCase();
    const hash = CryptoJS.MD5(trimmedEmail).toString();
    const baseUrl = 'https://www.gravatar.com/avatar/';

    return `${baseUrl}${hash}?s=${size}`;
}

module.exports = { getGravatarUrl };
