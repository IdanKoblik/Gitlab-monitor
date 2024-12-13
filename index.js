const { EmbedBuilder, WebhookClient } = require('discord.js');
const Gravatar = require('./utils/gravatar');
const path = require('path');
const express = require('express');
const pino = require('pino');
const fs = require('fs');

let configPath = '/home/container/config.json';

if (fs.existsSync(path.join(__dirname, 'config.json'))) 
    configPath = path.join(__dirname, 'config.json'); 

const { port, tokens } = require(configPath);

const maskSensitiveInfo = (value) => {
    if (!value)
        return value;

    if (value.length <= 6)
        return value;

    return value.slice(0, -6) + '*******';
}

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            customColors: 'info:blue,warn:yellow,error:red'
        }
    }
});

const HEADER = `
 ██████╗ ██╗████████╗██╗      █████╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗██╗████████╗ ██████╗ ██████╗
██╔════╝ ██║╚══██╔══╝██║     ██╔══██╗██╔══██╗    ████╗ ████║██╔═══██╗████╗  ██║██║╚══██╔══╝██╔═══██╗██╔══██╗
██║  ███╗██║   ██║   ██║     ███████║██████╔╝    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║   ██║   ██║██████╔╝
██║   ██║██║   ██║   ██║     ██╔══██║██╔══██╗    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║██╔══██╗
╚██████╔╝██║   ██║   ███████╗██║  ██║██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝ ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`;

const MAX_DESCRIPTION_LENGTH = 2000;

const app = express();
app.use(express.json());

const EMOJIS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    webhook: '🔗',
    server: '🖥️',
    event: '📡'
};

function verifyGitLabWebhook(req, res, next) {
    const signature = req.get('X-Gitlab-Token');

    if (!(signature in tokens)) {
        logger.error(
            `${EMOJIS.error} Unauthorized Access Attempt! 
            - IP: ${req.ip}
            - Method: ${req.method}
            - Path: ${req.path}
            - Invalid GitLab Token: ${maskSensitiveInfo(signature) || 'No token provided'}`
        );
        return res.status(401).send('Unauthorized');
    }

    res.discordWebhooks = tokens[signature];

    logger.info(
        `${EMOJIS.webhook} GitLab Webhook Verified 
        - Token: ${maskSensitiveInfo(signature)}
        - Connected Discord Webhooks: ${res.discordWebhooks.map(maskSensitiveInfo)}`
    );

    next();
}

app.post('/webhook', verifyGitLabWebhook, async (req, res) => {
    const payload = req.body;
    const objectKind = payload.object_kind;

    logger.info(
        `${EMOJIS.event} GitLab Event Received
        - Type: ${objectKind}
        - Project: ${payload.project?.name || 'Unknown'}
        - Sender: ${payload.user_name || 'Unknown User'}`
    );

    if (objectKind === "build" || objectKind === "deployment") {
        logger.warn(`${EMOJIS.warning} Skipping event: ${objectKind}`);
        return;
    }

    try {
        const event = (objectKind === "tag_push" || objectKind === "push") ? "push_tag" : objectKind;
        const handlerPath = path.join(__dirname, 'endpoints', `${event.toLowerCase()}.js`);
        const { eventHandler } = require(handlerPath);

        const embedData = await eventHandler(payload);

        const embed = new EmbedBuilder()
            .setAuthor({ name: embedData.username, iconURL: Gravatar.getGravatarUrl(embedData.email) })
            .setFooter({ text: payload.project.name })
            .setColor("#237feb")
            .setTimestamp()
            .setTitle(embedData.title)
            .setURL(embedData.url);

        if (embedData.fields && embedData.fields.length > 0)
            embed.setFields(embedData.fields);

        if (embedData.description && (embedData.description.length > 0 && embedData.description.length < MAX_DESCRIPTION_LENGTH))
            embed.setDescription(embedData.description);

        for (const webhook of res.discordWebhooks) {
            const webhookClient = new WebhookClient({ url: webhook });
            await webhookClient.send({ embeds: [embed] });

            logger.info(
                `${EMOJIS.success} Discord Webhook Dispatch
                - Destination: ${maskSensitiveInfo(new URL(webhook).hostname)}
                - Event Type: ${objectKind}`
            );
        }

        res.sendStatus(200);
    } catch (error) {
        logger.error(
            `${EMOJIS.error} Event Processing Error
            - Event Type: ${objectKind}
            - Error Message: ${error.message}
            - Stack Trace: ${error.stack}`
        );

        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(HEADER);
    logger.info(
        `${EMOJIS.server} GitLab Webhook Monitor Initialized
        - Listening Port: ${port}
        - Configured Tokens: ${maskSensitiveInfo(Object.keys(tokens).join(', '))}`
    );
});

module.exports = { app, maskSensitiveInfo };