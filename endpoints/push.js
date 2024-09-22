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

    for (let i = 0; i < len; i++) {
        const title = commits[i].title;
        const commitUrl = commits[i].url;
        const id = commits[i].id.substring(0, 7);
        sb.append(`[${'`' + id + '`'}](${commitUrl}) ${title}\n`);
    }

    const branchName = ref.substring(11);
    let title = `Pushed to branch \`${branchName}\``;
    let embedUrl = `${url}/-/tree/${branchName}`;
    if (after === EMPTY_COMMIT_SHA) { 
        title = `Branch \`${branchName}\` was destroyed`;
        embedUrl = "";
    } else if (before === EMPTY_COMMIT_SHA) 
        title = `Branch \`${branchName}\` was created`;
    
    return {
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
