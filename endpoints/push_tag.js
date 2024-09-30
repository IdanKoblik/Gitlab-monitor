const StringBuilder = require('../utils/stringBuilder');

const MAX_COMMITS_COUNT = 5;
const EMPTY_COMMIT_SHA = "0000000000000000000000000000000000000000";

const eventHandler = async (payload) => {
    const commits = payload.commits;
    const len = Math.min(commits.length, MAX_COMMITS_COUNT); 
    const sb = new StringBuilder();
    const ref = payload.ref;
    const url = payload.repository.homepage;
    const before = payload.before;
    const after = payload.after;

    const isTag = ref.startsWith('refs/tags/');
    const name = isTag ? ref.substring(10) : ref.substring(11);
    const type = isTag ? "Tag" : "Branch";
    const tree = isTag ? "tags" : "tree"
    const email = isTag ? "test@test.com" : payload.user_email;
    const username = payload.user_name;

    for (let i = 0; i < len; i++) {
        const title = commits[i].title;
        const commitUrl = commits[i].url;
        const id = commits[i].id.substring(0, 7);
        sb.append(`[${'`' + id + '`'}](${commitUrl}) ${title}\n`);
    }

    let title = `Pushed to ${type.toLocaleLowerCase()} \`${name}\``;
    let embedUrl = `${url}/-/${tree}/${name}`;
    if (after === EMPTY_COMMIT_SHA) { 
        title = `${type} \`${name}\` was destroyed`;
        embedUrl = "";
    } else if (before === EMPTY_COMMIT_SHA) 
        title = `${type} \`${name}\` was created`;
    
    return {
        username: username,
        email: email,
        title: title,
        url: embedUrl,
        description: sb.toString()
    };
};

module.exports = {
    MAX_COMMITS_COUNT,
    EMPTY_COMMIT_SHA,
    eventHandler
};
