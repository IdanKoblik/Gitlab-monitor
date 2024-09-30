const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookToken, webhookID, gitlabToken, port } = require('./config.json');
const Gravatar = require('./utils/gravatar')
const path = require('path');
const {log, LogLevel} = require('./logger')
const express = require('express');

const HEADER = `
 ██████╗ ██╗████████╗██╗      █████╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗██╗████████╗ ██████╗ ██████╗
██╔════╝ ██║╚══██╔══╝██║     ██╔══██╗██╔══██╗    ████╗ ████║██╔═══██╗████╗  ██║██║╚══██╔══╝██╔═══██╗██╔══██╗
██║  ███╗██║   ██║   ██║     ███████║██████╔╝    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║   ██║   ██║██████╔╝
██║   ██║██║   ██║   ██║     ██╔══██║██╔══██╗    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║██╔══██╗
╚██████╔╝██║   ██║   ███████╗██║  ██║██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝ ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`;

(function () {
    $consoleLog = console.log;
    console.log = function ($message, $color) {
      $consoleLog('%c' + $message, 'color:' + $color + ';font-weight:bold;');
    }
})();

const webhookClient = new WebhookClient({ id: webhookID, token: webhookToken });
const app = express();

app.use(express.json());

function verifyGitLabWebhook(req, res, next) {
    const signature = req.get('X-Gitlab-Token');
	  if (signature !== gitlabToken)
	    return res.status(401).send('Unauthorized');
	  
    next();
}
  
app.post('/webhook', verifyGitLabWebhook, async (req, res) => {
    const payload = req.body;
    const objectKind = payload.object_kind;
    console.log(`Received GitLab event: ${objectKind}`);  
    
    if (objectKind === "build" || objectKind === "deployment")
        return;

    log(`Received GitLab event: ${objectKind}`, LogLevel.SUCCESS);  
	
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
            .setURL(embedData.url)

        if (embedData.fields && embedData.fields.length > 0)
            embed.setFields(embedData.fields);

        if (embedData.description && (embedData.description.length > 0 && embedData.description.length < 2000))
            embed.setDescription(embedData.description);

        await webhookClient.send({ embeds: [embed] });
        res.sendStatus(200);
    } catch (error) {
        log(`Error handling GitLab event: ${error}`, LogLevel.ERROR);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    log(HEADER, LogLevel.START, false);
    console.log('\n');
	  log(`GitLab webhook receiver listening at port: ${port}`, LogLevel.INFO);
});
