require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const app = express();
const https = require('https');
const bot = new Client({ intents: [GatewayIntentBits.Guilds]});
const channelName = 'elvui-discord-bot-dev';

let version = '13.73';
let changedocRequest, changedocResponse;

bot.on('ready', async (client) => {
  console.log(`Logged in as ${bot.user.tag}`);
  checkNewVersion(client);
});

async function checkNewVersion(client) {
  console.log(`Checking new version against "${version}"`)
  setTimeout(()=> checkNewVersion(client), 1000*60*60*6);
  try {
    changedocRequest = await fetch('https://api.tukui.org/v1/addon/elvui');
    changedocResponse = await changedocRequest.json();
    if (version !== changedocResponse.version) {
      console.log(`A new version is available "${version}"`)
      version = changedocResponse.version;
      getNewVersion(client);
    } else {
      console.log('No updates, holding for 6 hours.');
    }
  } catch (err) {
    console.log(err);
  }
}

async function getNewVersion(client) {
  try {
    const channel = client.channels.cache.find(ch => ch.name === channelName);
    const changelogRequest = await fetch('https://api.tukui.org/v1/changelog/elvui');
    const changelogResponse = await changelogRequest.text();
    const [,lastVersionChanges] = changelogResponse.split('###');
    const changelog = `### ElvUI ${lastVersionChanges.trim()}\n[Download](http://159.203.80.149:8080)`;

    console.log(`Posting new version to channel "${channelName}"`)
    channel.send(changelog);
  } catch (err) {
    console.log(err);
  }
}

bot.login(process.env.TOKEN);

app.get('/', async (req, res) => {
  try {
    const payload = await fetch('https://api.tukui.org/v1/addon/elvui');
    const data = await payload.json();

    console.log(`redirecting to: "${data.url}"`);
	  const externalRequest = https.request(data.url, externalResponse => {
		  res.setHeader('content-disposition', `attachment; filename=elvui-${version}.zip`);
		  externalResponse.pipe(res);
	  });
	  externalRequest.end();
  } catch (err) {
    console.log(err);
  }
});

app.listen(parseInt(process.env.PORT), () => {
  console.log(`SeriouslyCasual listening on port ${process.env.PORT}`);
})
