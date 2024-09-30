const eventHandler = async (payload) => {
    const attributes = payload.object_attributes;
    const status = attributes.status;
    const iid = attributes.iid;
    const url = attributes.url;
    const duration = attributes.duration; // seconds
    const builds = attributes.builds || [];
    const ref = attributes.ref;

    const username = payload.user.username;
    const email = payload.user.email;

    const titleMap = {
        success: `Pipeline \`#${iid}\` succeeded`,
        failed: `Pipeline \`#${iid}\` failed`,
        running: `Starting pipeline \`#${iid}\``,
        pending: `Pipeline \`#${iid}\` is pending`,
        canceled: `Pipeline \`#${iid}\` was canceled`,
    };

    const title = titleMap[status] || `Pipeline \`#${iid}\` status: ${status}`;
    description = (builds.length > 0 && status === "failed") ? builds.find(build => build.status === "failed").failure_reason : "";
    const fields = [
        { name: 'Source', value: ref, inline: true },
        { name: 'Duration', value: `${duration} seconds`, inline: true },
    ];

    return {
        username: username,
        email: email,
        url: url,
        title: title,
        description: description,
        fields: fields
    };
}

module.exports = {
    eventHandler
};