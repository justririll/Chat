<template>
    <div id="chat">
      <ChatMessage v-for="mes in Messages" :key="mes" :Emotes="Emotes" :GlobalBadges="GlobalBadges" :Paints="Paints" :OtherBadges="OtherBadges" :defaultColors="defaultColors" :payload="mes" :BG="mes.BG"/>
    </div>
</template>
  
<script>
  // значки ффз (и чаттерино?)

  import ChatMessage from '@/components/ChatMessage.vue'
  import apis from '@/methods/tpd.js'
  import EventApi from '@/methods/eventapi.js'
  import Twitch from '@/methods/twitch.js'
  
  export default {
    name: 'chat-page',
    components: {
      ChatMessage
  },
    data() {
      return {
        EventApi: null,

        // settings:
        // value: selectedValue || defaultValue
        paintsEnabled: this.$route.query.paints || "1",
        font_size: this.$route.query.font_size || "18",
        // value: selectedValue != off (true by default)
        altBG: this.$route.query.altbg != "0",
        useEventAPI: this.$route.query.eventapi != "0",

        // other:
        channel: this.$route.query.channel,
        currBG: true,
        IsDisconnected: false,
        Emotes: [],
        GlobalBadges: [],
        OtherBadges: [],
        Paints: [],
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
      onEmoteDelete(e) {
        this.Emotes = this.Emotes.filter(item => item.ID !== e.old_value.id)
      },
      onEmoteAdd(e) {
        this.Emotes.push({"Name": e.value.name, "ID": e.value.id, "Type": "7TV"})
      },
      onEmoteRename(e) {
        for (let emote of this.Emotes) {
          if (emote.ID == e.value.id) {
            emote.Name = e.value.name
          }
        }
        this.Emotes.push({"Name": e.value.name, "ID": e.value.id, "Type": "7TV"})
      },
      async onUserID(id) {
          if (this.channelID == null) {
            this.channelID = id

            let subs = await apis.getSubscriberBadges(this.channelID)
            if (subs) {
              this.GlobalBadges["subscriber"] = subs
            }
            let stv = await apis.get7tvEmotes(this.channelID)
            this.Emotes = this.Emotes.concat(stv[0])
            this.Emotes = this.Emotes.concat(await apis.getBttvEmotes(this.channelID))

            // initializing event api
            if (this.useEventAPI) {
              this.EventApi = new EventApi(stv[1], this.channelID, this.onEmoteDelete, this.onEmoteAdd, this.onEmoteRename)
              this.EventApi.Connect()
            }
          }
        }
    },
    created: async function() {
        // creating websocket
        this.client = new Twitch(this.channel);

        this.client.OnUserId = this.onUserID
        this.client.OnPrivateMessage = async (payload) => {
          payload.BG = "#2b2b2b"
          if (this.altBG) {
            payload.BG = this.currBG ? "#2b2b2b" : "#242424"
            this.currBG = !this.currBG
          }
          this.Messages.push(payload)
        }
        this.client.OnClearChat = async (payload) => {
          this.Messages = this.Messages.filter(item => item.source.nick !== payload.parameters)
        }
        this.client.OnClearMessage = async (payload) => {
          this.Messages = this.Messages.filter(item => item.tags["id"] !== payload.tags["target-msg-id"])
        }

        this.client.connect()
        // getting data

        try {
          let userid = await apis.getUserID(this.channel)
          this.onUserID(userid)
        } catch (error) {
          // pass
        }

        this.Emotes = this.Emotes.concat(await apis.get7tvGlobalEmotes())
        console.log("loaded 7tv global emotes")
        this.Emotes = this.Emotes.concat(await apis.getBttvGlobalEmotes())
        console.log("loaded bttv global emotes")
        this.Emotes = this.Emotes.concat(await apis.getFfzEmotes(this.channel))
        console.log("loaded ffz channel emotes")
        this.Emotes = this.Emotes.concat(await apis.getFfzGlobalEmotes())
        console.log("loaded ffz global emotes")

        let gb = await apis.getGlobalBadges()
        if (this.GlobalBadges["subscriber"]) {
          gb["subscriber"] = this.GlobalBadges["subscriber"]
        }
        this.GlobalBadges = gb

        let bp = await apis.get7tvBadgesPaints()
        this.OtherBadges = bp[0]
        this.Paints = bp[1]
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
  