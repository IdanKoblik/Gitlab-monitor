const eventHandler = async (payload) => {
    const user = payload.user;
    const email = user.email;
    const username = user.user;

    const attributes = payload.object_attributes;
    const noteableType = attributes.noteable_type;
    const note = attributes.note;
    const url = attributes.url;

    let embedTitle = "Left a comment on "
    if (noteableType === "Issue") {
        const iid = payload.issue.iid;
        const title = payload.issue.title;
        embedTitle += `issue \`#${iid} ${title}\``
    } else if (noteableType === "MergeRequest") {
        const iid = payload.merge_request.iid;
        const title = payload.merge_request.title;
        embedTitle += `merge request \`#${iid} ${title}\``
    }

    return {
        username: username,
        email: email,
        url: url,
        title: embedTitle,
        description: note
    };
}

module.exports = {
    eventHandler
};
