const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookToken, webhookID, gitlabToken, port } = require('./config.json');
const path = require('path');
const express = require('express');

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
    console.log(`Received GitLab event: ${event}`);  
	
    try {
        const handlerPath = path.join(__dirname, 'endpoints', `${event.toLowerCase()}.js`);
        const eventHandler = require(handlerPath);
        await eventHandler(webhookClient, payload);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling GitLab event:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
	console.log(`GitLab webhook receiver listening at port: ${port}`);
});