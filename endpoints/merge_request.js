const eventHandler = async (payload) => {
    const user = payload.user;
    const email = user.email;
    const username = user.username;

    const attributes = payload.object_attributes;
    const action = attributes.action;
    const iid = attributes.iid;
    const title = attributes.title;
    const url = attributes.url;
    const source = attributes.source_branch;
    const target = attributes.target_branch;
    const description = attributes.description;

    const labels = attributes.labels || [];

    let embedAction = `${action.charAt(0).toUpperCase() + action.slice(1)}`
    if (action.endsWith('e'))
        embedAction += "d";
    else if (action === 'approval')
        embedAction = 'Approved';
    else if (action === 'unapproval')
        embedAction = 'Unapproved';
    else
        embedAction += 'ed';
    
    const embedTitle = `${embedAction.charAt(0).toUpperCase() + embedAction.slice(1)} merge request \`#${iid} ${title}\``;
    const fields = [
        { name: "From", value: source, inline: true},
        { name: "To", value: target, inline: true},
        { name: 'Labels', value: (labels.length > 0) ? labels.map(label => label.title).join(', ') : 'None', inline: true }
    ]

    return {
        username: username,
        email: email,
        url: url,
        title: embedTitle,
        fields: fields,
        description: description
    };
}

module.exports = {
    eventHandler
};