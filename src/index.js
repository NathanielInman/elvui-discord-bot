require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const app = express();
const bot = new Client({ intents: [GatewayIntentBits.Guilds]});
const channelName = 'elvui-discord-bot-dev';

let version = '13.74';
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
      getNewVersion();
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
    const changelog = `### ElvUI ${lastVersionChanges.trim()}\n[Download](${changedocResponse.url})`;

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

    res.redirect(data.url);
  } catch (err) {
    console.log(err);
  }
});

app.listen(parseInt(process.env.PORT), () => {
  console.log(`SeriouslyCasual listening on port ${process.env.PORT}`);
})
