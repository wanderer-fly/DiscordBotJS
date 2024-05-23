const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const path = require('path')
const fs = require('fs')
const sodium = require('libsodium-wrappers')
const config = require(path.resolve(__dirname, '../../../config.json'))
const musicPath = config.musicPath

// Function to get all mp3 files in the music directory
function getMusicFiles() {
    try {
        return fs.readdirSync(musicPath).filter(file => file.endsWith('.mp3'))
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`[ERROR] Music directory not found: ${musicPath}`)
            return []
        } else {
            throw error
        }
    }
}

// Play a specific music file or list of files
async function playMusicFile(message, connection, player, musicFiles, currentIndex = 0, loop = false, loopAll = false) {
    const musicFile = musicFiles[currentIndex]
    const resource = createAudioResource(path.join(musicPath, musicFile))

    player.play(resource)

    player.once(AudioPlayerStatus.Idle, () => {
        if (loop) {
            playMusicFile(message, connection, player, musicFiles, currentIndex, loop)
        } else if (loopAll && currentIndex === musicFiles.length - 1) {
            playMusicFile(message, connection, player, musicFiles, 0, false, loopAll)
        } else if (currentIndex < musicFiles.length - 1) {
            playMusicFile(message, connection, player, musicFiles, currentIndex + 1, false, loopAll)
        } else {
            connection.destroy()
        }
    })

    connection.subscribe(player)

    message.channel.send(`Now playing: ${musicFile}`)
}

module.exports = {
    name: 'play',
    description: 'Plays music from the music directory.',
    async execute(message, args) {
        await sodium.ready

        const musicFiles = getMusicFiles()

        if (musicFiles.length === 0) {
            message.channel.send('No music files found in the music directory.')
            return
        }

        if (message.member.voice.channel) {
            const channel = message.member.voice.channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            })

            const player = createAudioPlayer()
            let loop = false
            let loopAll = false

            if (args.length === 0) {
                playMusicFile(message, connection, player, musicFiles)
            } else if (args[0] === 'list') {
                message.channel.send(`Available music files:\n${musicFiles.join('\n')}`)
            } else if (args[0] === 'exit') {
                connection.destroy()
                message.channel.send('Stopped playing and left the voice channel.')
            } else {
                if (args[0] === 'loop') {
                    loopAll = true
                    playMusicFile(message, connection, player, musicFiles, 0, false, loopAll)
                } else {
                    const musicFile = args[0] + '.mp3'
                    if (musicFiles.includes(musicFile)) {
                        if (args[1] === 'loop') {
                            loop = true
                        }
                        playMusicFile(message, connection, player, [musicFile], 0, loop)
                    } else {
                        message.channel.send(`Music file ${args[0]} not found.`)
                    }
                }
            }
        } else {
            message.reply('You need to join a voice channel first!')
        }
    }
}
