const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientid } = require('./config.js');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client(undefined);

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

const guildId = '708322038812639252';

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

async function addCommands() {
        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(
                Routes.applicationGuildCommands(clientid, guildId),
                {body: commands},
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
}

function saveSettings() {
    fs.writeFileSync('./settings.json', JSON.stringify(settings));
}

function setSuggestionBox(channel, guild) {
    settings[guild]['sugestionbox'] = channel;
    saveSettings();
}

function setVerificationChannel(channel, guild) {
    settings[guild]['verification'] = channel;
    saveSettings();
}

function genEmbed(user, suggestion) {
    const date = Date.now();
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const stringDate = day.toString() + "/" + month.toString() + "/" + year.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString();
    return {
        "title": "New Suggestion",
        "description": suggestion,
        "color": 16750848,
        "fields": [
            {
                "name": "Author",
                "value": "<@" + user.id + ">",
                "inline": true
            },
            {
                "name": "Date",
                "value": stringDate,
                "inline": true
            }
        ],
        "footer": {
            "text": "Suggestion Box",
            "icon_url": "https://cdn.discordapp.com/app-icons/937748275933630534/31bd4ed47107e7aaed516851ade688fe.png?size=256"
        }
    };
}

function genActionbar() {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('accept')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
        );
}

client.on('interactionCreate', async inter => {
    if (!inter.isCommand() && !inter.isButton()) return;
    if (inter.isCommand()) {
        await inter.deferReply();
        const command = inter.commandName;
        if (command.name === 'suggest') {
            inter.reply({"content": "Suggestion created!", "ephemeral": true});
            client.channels.cache.get(settings[inter.guildId.toString()]['suggestionbox']).send({ "embeds": [genEmbed(inter.user, inter.options.getString('suggestion'))]});
            client.channels.cache.get(settings[inter.guildId.toString()]['verification']).send({ "embeds": [genEmbed(inter.user, inter.options.getString('suggestion'))], "compoonnets": [ genActionbar() ]});
        }
    }
});

client.on('ready', () => {
    console.log('Bot is ready!');
    console.log('Logged in as' + client.user.tag + ' with ID ' + client.user.id + '!');
    addCommands().then(r => {});
});

client.login(token).then(r => {});