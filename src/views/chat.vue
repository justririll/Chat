<template>
    <div id="chat">
      <ChatMessage v-for="mes in Messages" :key="mes" :Emotes="Emotes" :Message="mes.Message" :User='mes.User' :Badges='mes.Badges'/>
    </div>
</template>
  
<script>
  import ChatMessage from '@/components/ChatMessage.vue'
  import chat from '@/methods/chat.js'
  import apis from '@/methods/tpd.js'
  
  export default {
    name: 'chat-page',
    components: {
      ChatMessage
  },
    data() {
      return {
        Emotes: [{"Name": "123", "Url": "https://cdn.7tv.app/emote/62b371656477bc14fa60caa9/1x.webp"},
                {"Name": "modcheck", "Url": "https://cdn.7tv.app/emote/62e833bde328a524eef784d7/1x.webp"}],
        GlobalBadges: [],
        channel: this.$route.query.channel,
        channelID: null,
        client: null,
        Messages: [],
        defaultColors: ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"],
      }
    },
    updated() {
      window.scrollTo(0,document.body.scrollHeight);
      if (this.Messages.length > 50) {
        this.Messages.shift()
      }
    },
    methods: {
      createLogMessage(message) {
        return {"User": {"Login": "chat", "DisplayName": "Chat", "Color": "rgb(255, 255, 255)"},
         "Message": message, "Badges": []}
      },
      getMessageFromPayload(payload) {
        if (payload.command != "PRIVMSG") {
            return {}
        }
        if (payload.tags["display-name"] == undefined) {
            payload.tags["display-name"] = payload.user
        }
        if (payload.tags.color == "") {
            payload.tags.color = this.defaultColors[Math.floor(Math.random() * this.defaultColors.length)]
        }
        let Badges = []
        let pos = 1
        for (const [key, value] of Object.entries(payload.tags["badges"])) {
            Badges.push({"Url": this.GlobalBadges[key][value], "Position": pos})
        }

        return {"User": {"Login": payload.user, "DisplayName": payload.tags["display-name"], "Color": payload.tags.color},
                "Message": payload.message, "Badges": Badges}
      }
    },
    created: async function() {
        // creating websocket
        this.client = new WebSocket("ws://irc-ws.chat.twitch.tv:80");

        this.client.onmessage = (e) => {
            let payload = chat.parseMessage(e)

            switch (payload.command) {
                // announce - USERNOTICE
                // добавить удаление сообщений - CLEARCHAT & CLEARMSG
                // 
                case "PRIVMSG":
                    if (this.channelID == null) {
                        this.channelID = payload.tags["room-id"]
                    }
                    console.log(this.getMessageFromPayload(payload))
                    this.Messages.push(this.getMessageFromPayload(payload))
                    break;
                case "PING":
                    this.client.send(`PONG ${payload.message}`)
            }
        }
        this.client.onopen = () => {
            this.Messages.push(this.createLogMessage("Connected."))
            this.client.send("NICK justinfan1337")
            this.client.send("JOIN #" + this.channel);
            this.client.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
        }
        // getting data
        this.GlobalBadges = await apis.getGlobalBadges()
    }
  }
</script>
  
<style>
  body {
    margin: 0px;
    overflow: hidden;
  }
  #chat {
    position: absolute;
    width: 100%;
    padding: 0;
  
    overflow: hidden;

  }
</style>
  