const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookToken, webhookID, gitlabToken, port } = require('./config.json');
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
	const event = payload.object_kind;
    log(`Received GitLab event: ${event}`, LogLevel.SUCCESS);  
	
    try {
        const handlerPath = path.join(__dirname, 'endpoints', `${event.toLowerCase()}.js`);
        const eventHandler = require(handlerPath);
        await eventHandler(webhookClient, payload);
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