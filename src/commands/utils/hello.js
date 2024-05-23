module.exports = {
    name: 'hello',
    description: 'Reply a hello',
    execute(message, args) {
        if (args && args.length > 0) {
            message.channel.send(`Hello, ${args.join(' ')}`)
        } else {
            message.channel.send(`Hello, ${message.author.username}`)
        }
    }
}