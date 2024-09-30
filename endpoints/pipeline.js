const eventHandler = async (payload) => {
    const attributes = payload.object_attributes;
    const status = attributes.status;
    const iid = attributes.iid;
    const url = attributes.url;
    const duration = attributes.duration; // secs
    const builds = attributes.builds || [];

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

    return {
        username: username,
        email: email,
        url: url,
        title: title,
        description: description
    };
}

module.exports = {
    eventHandler
};