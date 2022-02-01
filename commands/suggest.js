const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports.data = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Creates a suggestion')
    .addStringOption(option =>
        option.setName('suggestion')
            .setRequired(true)
            .setDescription('The suggestion')
    );