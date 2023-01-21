import chat from '@/methods/chat.js'

export default class Twitch {
    constructor(channel) {
        this.ws = null
        this.IsDisconnected = false

        this.channel = channel
        this.channelID = null

        this.OnUserId = null
        this.OnPrivateMessage = null
        this.OnClearChat = null
        this.OnClearMessage = null
    }

    connect() {
        if (this.IsDisconnected) {
            return
        }

        this.ws = new WebSocket("ws://irc-ws.chat.twitch.tv:80");
        this.ws.onmessage = (e) => this.onMessage(e)
        this.ws.onopen = () => this.onOpen()
        this.ws.onerror = () => this.onError()
        this.ws.onclose = () => this.onClose()
    }

    async onError() {
        console.log("Connection error occured, disconnecting...")
        this.ws.close()
    }

    async onClose() {
        console.log("Disconnected, attempting to reconnect...")
        this.IsDisconnected = true
        setInterval(() => {
            this.connect()
        }, 1000);
    }

    async onOpen() {
        console.log("1232132312")
        this.IsDisconnected = false;
        this.ws.send("NICK justinfan1337")
        this.ws.send("JOIN #" + this.channel.toLowerCase());
        this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
    }

    async onMessage(e) {
        let messages = e.data.split("\r\n")

        messages.forEach(message => {
          let payload = chat.parseMessage(message)
          if (!payload) {
            return
          }

          switch (payload.command.command) {
              // announce - USERNOTICE
              // нужно добавить реконнект
              case "CLEARCHAT":
                this.OnClearChat(payload)
                // this.Messages = this.Messages.filter(item => item.source.nick !== payload.parameters)
                break
              case "CLEARMSG":
                this.OnClearMessage(payload)
                // this.Messages = this.Messages.filter(item => item.tags["id"] !== payload.tags["target-msg-id"])
                break
              case "PRIVMSG":
                  if (this.channelID == null) {
                    this.channelID = payload.tags["room-id"]
                    this.OnUserId(payload.tags["room-id"])
                  }
                  this.OnPrivateMessage(payload)
                  break;
              case "PING":
                  this.ws.send(`PONG ${payload.message}`)
          }
        })
    }
}