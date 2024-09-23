const eventHandler = async (payload) => {
    const attributes = payload.object_attributes;
    const action = attributes.action;
    const iid = attributes.iid;
    const issueTitle = attributes.title;
    const description = attributes.description;
    const url = attributes.url;
    const email = payload.user.email;
    const username = payload.user.username;

    const assignees = payload.assignees || [];
    const labels = attributes.labels || [];

    const fields = [
        { name: 'Assignees', value: assignees.length > 0 ? assignees.map(assignee => assignee.name).join(', ') : 'None', inline: true },
        { name: 'Labels', value: (labels.length > 0) ? labels.map(label => label.title).join(', ') : 'None', inline: false },
    ];

    let embedTitle = `${action.charAt(0).toUpperCase() + action.slice(1)}`
    action === "close" ? embedTitle += "d": embedTitle += "ed";
    const title = `${embedTitle} issue \`#${iid} ${issueTitle}\``;

    return {
        username: username,
        email: email,
        title: title,
        fields: fields,
        url: url,
        description: description,
    };
}

module.exports = {
    eventHandler
};
