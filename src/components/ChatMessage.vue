<template>
    <div class="ChatMessage">
      <div v-for="badge in Badges" :key="badge" class="Badge">
          <img :src="badge.Url">
      </div>
      <span>
      <span :HavePaints="HavePaints" v-if="displayName.toLowerCase() == this.payload.source.nick" class="message-nick" :style="{color: color, backgroundImage: bgImage}">{{ displayName }}:</span>
      <span :HavePaints="HavePaints" v-if="displayName.toLowerCase() != this.payload.source.nick" class="message-nick" :style="{color: color, backgroundImage: bgImage}">{{this.payload.source.nick}} ({{ displayName }}):</span>
        <span class="message-text" v-html="FinalMessage"></span>
      </span>
    </div>
</template>

<script>
import Common from '@/methods/common'
import twemoji from 'twemoji'

// @todo: zero-width emotes

export default {
  name: 'ChatMessage',
  data() {
    return {
      EmotesBaseUrl: {
        "7TV": "https://cdn.7tv.app/emote/{0}/2x.webp",
        "BTTV": "https://cdn.betterttv.net/emote/{0}/2x",
        "FFZ": "https://cdn.frankerfacez.com/emote/{0}/2",
        "TWITCH": ""
      },
      Paint: null,
      HavePaints: false,
      displayName: "",

      color : "",

      Badges: [],
       paintsEnabled: this.$route.query.paints || "1",
      font_size: this.$route.query.font_size || "18",
      interpolateSize: this.$route.query.interpbs != "0",
    }
  },
  props: {
    Emotes: Array,
    OtherBadges: Array,
    GlobalBadges: Object,
    Paints: Array,

    defaultColors: Array,

    payload: Object,
    BG: String,
  },
  created: async function() {
      if (this.payload.command.command != "PRIVMSG") {
          return {}
      }
      this.displayName = this.payload.tags["display-name"]
      if (this.payload.tags["display-name"] == undefined) {
        this.displayName = this.payload.user
      }
      this.color = this.payload.tags.color
      if (!this.payload.tags.color) {
        this.color = this.defaultColors[Math.floor(Math.random() * this.defaultColors.length)]
      }
      // twitch badges
      if (this.payload.tags.badges) {
        for (const [key, value] of Object.entries(this.payload.tags["badges"])) {
          if (this.GlobalBadges[key]) {
            this.Badges.push({"Url": this.GlobalBadges[key][value]})
          }
        }
      }
      // parse extension badges
      if (this.OtherBadges) {
        for (const value of this.OtherBadges) {
          if (value.Users.includes(this.payload.tags["user-id"])) {
            this.Badges.push({"Url": value.Url})
          }
        }
      }
      // 7tv paints
      if (this.paintsEnabled == "1") {
        for (const value of this.Paints) {
          if (value.users.includes(this.payload.tags["user-id"])) {
            this.HavePaints = true
            this.Paint = value
            break
          }
        }
      }

      // return {"User": {"Login": this.payload.user, "DisplayName": displayName, "Color": color},
      //         "Message": this.payload.message, "Badges": Badges}
  },
  computed: {
    FinalMessage() { // message with emotes and etc.
      let TempMessage = ` ${this.payload.parameters} `

      if (this.payload.tags.emotes) {
        let twitchEmotes = Common.parse_smiles(TempMessage, this.payload.tags["emotes"])
        for (const [k,v] of Object.entries(twitchEmotes)) {
        while (TempMessage.includes(` ${k} `)) {
          TempMessage = TempMessage.replace(` ${k} `, ` <img src="${v}" class="Emote"> `)
        }
      }
      }

      for (const key of this.Emotes) {
        if (key) {
          while (TempMessage.includes(` ${key.Name} `)) {
            if (key.ZeroWidth) {
              TempMessage = TempMessage.replace(` ${key.Name} `, ` <img src="${this.EmotesBaseUrl[key.Type].replace('{0}', key.ID)}" class="Emote" ZeroWidth="true"> `)
            } else {
              TempMessage = TempMessage.replace(` ${key.Name} `, ` <img src="${this.EmotesBaseUrl[key.Type].replace('{0}', key.ID)}" class="Emote"> `)
            }
          }
        }
      }
      TempMessage = twemoji.parse(TempMessage)
      return TempMessage
    },
    bgImage() {
      if (!this.Paint) {
        return ""
      }
      const ccsFunc = this.Paint.function

      const args = []
      switch (this.Paint.function) {
          case "linear-gradient":
              args.push(`${this.Paint.angle}deg`)
              break;
          case "radial-graient":
              args.push(this.Paint.shape ?? "circle")
              break
          case "url":
              args.push(this.Paint.image_url ?? "")
              break
      }
      let funcPrefix = ""
      if (this.Paint.function !== "URL") {
          funcPrefix = this.Paint.repeat ? "repeating-" : ""
      }
      for (const stop of this.Paint.stops) {
          const color = Common.DecimalToStringRGBA(stop.color)
          args.push(`${color} ${stop.at * 100}%`)
      }
      return `${funcPrefix}${ccsFunc}(${args.join(", ")})`
    },
    filter() {
      try {
        return this.Paint.drop_shadows
        .map((v) => `drop-shadow(${v.x_offset}px ${v.y_offset}px ${v.radius}px ${Common.DecimalToStringRGBA(v.color)})`)
        .join(" ");
      } catch (error) {
        return ""
      }
    },
    paintColor() {
      if (!this.Paint) {
        return ""
      }
      return Common.DecimalToStringRGBA(this.Paint.color)
    },
    badgeSize() {
      if (this.interpolateSize && parseInt(this.font_size)) {
        return Math.round(0.8 * parseInt(this.font_size) + 4.4).toString() + "px"
      }
      return "18px"
    },
    emoteSize() {
      if (this.interpolateSize && parseInt(this.font_size)) {
        return (parseInt(this.font_size) + 14).toString() + "px"
      }
      return "32px"
    },
    messageSize() {
      if (this.interpolateSize && parseInt(this.font_size)) {
        return Math.round(1.33 * parseInt(this.font_size) + 7).toString() + "px"
      }
      return "31px"
    },
    Font_Size() {
        return `${this.font_size}px`
    }
  }
}
</script>

<style>
  .Badge {
    display: inline-block;
    padding-right: 3px;
  }
  .Badge img {
    width: v-bind(badgeSize);
    /* vertical-align: middle; */
  }
  .ChatMessage {
    padding-top: 3px;
    padding-bottom: 3px;
    padding-left: 5px;

    min-height: v-bind(messageSize);
    font-size: v-bind(Font_Size);

    width: 100%;

    display: inline-block;

    background: v-bind(BG);
    color: white;
    border-top: 2px solid black;
  }
  .message-text {
    bottom: 5px;
    margin-right: 13px;
  }
  .message-text img, .emoji {
    height: v-bind(emoteSize);
    vertical-align: middle;
  }
  .message-nick {
    font-weight: 700;

    /* background-size: cover; */
    filter: v-bind('filter');
    color: v-bind('paintColor');
  }
  .message-nick[HavePaints="true"] {
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text !important;
    background-color: currentcolor;
  }
  .message-text img[ZeroWidth="true"] {
    position: absolute;
		z-index: 1;
		transform: translateX(-100%);
  }
</style>
