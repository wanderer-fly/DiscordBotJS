require('./utils/consoleColors')

const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const configPath = path.resolve(__dirname, '..', 'config.json')
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

// Check if config.json not exist
if (!fs.existsSync(configPath)) {
    console.warn('[WARN] config.json does not exist. Generating a new one...')
    const defaultConfig = {
        prefix: '/',
        token: 'YOUR_DISCORD_BOT_TOKEN'
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    console.warn('config.json has been generated. Please fill in your bot token and restart the bot.')
    process.exit(1)
}

const { prefix, token } = require(configPath)

// For Discord API v13 or later
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        // ...
    ]
})

client.commands = new Discord.Collection()

// Read all the commands
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        // Check if the command object has 'data' property
        if ('data' in command) {
            // If the command has 'data', treat it as a SlashCommand
            client.commands.set(command.data.name, command)
            console.info(`[LOAD] Loaded SlashCommand: ${command.data.name}`)
        } else {
            // If the command is a function, treat it as a MessageCommand
            client.commands.set(command.name, command)
            console.info(`[LOAD] Loaded MessageCommand: ${command.name}`)
        }
    }
}

client.once('ready', () => {
    console.info("Server ready! (*v*)")
    console.info(`[INFO] Logged in as ${client.user.tag}!`)
})

// MessageCommandHandler
client.on('messageCreate', async(message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    const command = client.commands.get(commandName)

    if (!command) {
        message.channel.send('Unknown Command!')
        return
    }

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(`[Error] ${error}`)
        message.reply('There was an error trying to execute that command!')
    }
} )

// SlashCommandHandler
client.on(Discord.Events.InteractionCreate, async(interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if(!command) {
        console.error(`[ERROR] No such command ${interaction.commandName}`)
        return
    }

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(`[Error] ${error}`)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
})

client.login(token)