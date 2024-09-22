const { EmbedBuilder } = require('discord.js');
const StringBuilder = require('../utils/stringBuilder');
const Gravatar = require('../utils/gravatar')
const MAX_COMMITS_COUNT = 5;

module.exports = async (webhookClient, payload) => {
    const commits = payload.commits;
    const len = Math.min(commits.length, MAX_COMMITS_COUNT); 
    const sb = new StringBuilder();
    const ref = payload.ref;
    const url = payload.repository.homepage;
    for (let i = 0; i < len; i++) {
        const title = commits[i].title;
        const url = commits[i].url;
        const id = commits[i].id.substring(0, 7);
        sb.append('[' + '`' + `${id}` + '`' + ']' + '(' + `${url}` + ')')
        .append(' ')
        .append(title)
        .append('\n');
    }

    const embed = new EmbedBuilder()
        .setTitle('`' + `Pushed to branch ${ref.substring(11, ref.length)}` + '`')
        .setAuthor({ name: payload.user_username, iconURL: Gravatar.getGravatarUrl(payload.user_email) })
        .setURL(`${url}/-/tree/${ref.substring(11, ref.length)}`)
        .setDescription(sb.toString())
        .setFooter({ text: payload.project.name})
        .setColor("#237feb")
        .setTimestamp();

    await webhookClient.send({ embeds: [embed] });
};
