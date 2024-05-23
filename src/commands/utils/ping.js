const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    /*
    At a minimum, the definition of a slash command must have a name and a description.
    Slash command names must be between 1-32 characters and contain no capital letters, spaces, or symbols other than - and _.
    */
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping-pong!!!'),
    async execute(interaction) {
        await interaction.deferReply()
        await interaction.editReply({ content: "Pong!", ephemeral: true })
    }
}

