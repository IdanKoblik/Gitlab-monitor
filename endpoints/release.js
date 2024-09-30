const eventHandler = async (payload) => {
    const commitAuthor = payload.commit.author;
    const email = commitAuthor.email;
    const authorName = commitAuthor.name;
    const description = payload.description;
    const action = payload.action;
    const url = payload.url;
    const name = payload.name;

    const assets = payload.assets;
    const sources = assets.sources || [];
    const links = assets.links || [];

    const title = `${action.charAt(0).toUpperCase() + action.slice(1)}d release \`${name}\``;
    let fields = [
        { name: 'Sources', value: (sources.length > 0) ? sources.map(source => `[${source.format}](${source.url})`).join(', ') : 'None', inline: true },
        { name: 'Links', value: (links.length > 0) ? links.map(link => `[${link.name}](${link.url})`).join(', ') : 'None', inline: true },
    ];

    return {
        username: authorName,
        email: email,
        url: url,
        description: description,
        title: title,
        fields: fields
    };
}

module.exports = {
    eventHandler
};