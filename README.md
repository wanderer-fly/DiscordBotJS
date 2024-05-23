# DiscordBotJS

# Installion

### Install FFmpeg


```
sudo pacman -S ffmpeg
```

### Install node_modules

```
npm i
```

# Start

```
npm deploy # Deploy slash commands, only execute once

npm start
```

# Commands

## Message Commands

1. `hello`      reply with `hello, xxx` (xxx is your name or args)

2. `play`
    play music.mp3 from `musicPath` in `config.json`

        - play list         list all mp3 files

        - play [loop]       play all music

        - play xx [loop]    play xx.mp3

        -play exit          exit

## Slash Commands

1. `ping`     reply with `Pong!!`