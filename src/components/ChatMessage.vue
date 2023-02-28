<template>
    <div class="ChatMessage">
      <div v-for="badge in Badges" :key="badge" class="Badge">
          <img :src="badge.Url">
      </div>
      <span>
        <span :HavePaints="HavePaints" v-if="displayName.toLowerCase() == this.payload.source.nick" class="message-nick" :style="{color: color, backgroundImage: bgImage}">{{ displayName }}: </span>
        <span :HavePaints="HavePaints" v-if="displayName.toLowerCase() != this.payload.source.nick" class="message-nick" :style="{color: color, backgroundImage: bgImage}">{{this.payload.source.nick}} ({{ displayName }}): </span>
        <span class="message-text">
          <template v-for="mes in FinalMessage" :key="mes">
            <img v-if="mes.Type=='emote'" :src="mes.Text" :ZeroWidth="mes.ZeroWidth">
            <template v-if="mes.Type=='text'">{{mes.Text}}</template>
          </template>  
        </span>
      </span>
    </div>
</template>

<script>
import Common from '@/methods/common'
import ColourDistance from '@/methods/colour'
// import twemoji from 'twemoji'

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

      dot : 0,

      Badges: [],
      paintsEnabled: this.$route.query.paints || "1",
      shadowText: this.$route.query.shadowtext || "0",
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
    color() {
      let color = this.payload.tags.color
      if (!this.payload.tags.color) {
        color = this.defaultColors[Math.floor(Math.random() * this.defaultColors.length)]
      }
      // @todo: добавить убавление яркости
      if (this.BG != "transparent") {

        // если сообщение сливается с фоном:
        let userRGB = Common.hexToRgb(color)
        let backgroundRGB = Common.hexToRgb(this.BG)

        // схожесть цветов
        // let distance = Math.sqrt(((userRGB[0] - backgroundRGB[0])**2) + ((userRGB[1] - backgroundRGB[1])**2) + ((userRGB[2] - backgroundRGB[2])**2))

        let userXYZ = ColourDistance.rgb2xyz(userRGB[0], userRGB[1], userRGB[2])
        let backgroundXYZ = ColourDistance.rgb2xyz(backgroundRGB[0], backgroundRGB[1], backgroundRGB[2])


        let distance = ColourDistance.deltaE00(userXYZ[0], userXYZ[1], userXYZ[2], backgroundXYZ[0], backgroundXYZ[1], backgroundXYZ[2]) * 10

        if (distance == 0) {
          distance = 0.01
        }
        if (distance < 0.3) {
          // значит фон сливается, теперь мы добавляем/убавляем +40% яркость пользователю
          // let gray = Common.toGray(color)
          // if (gray > 0.6) {
          //   let newColor = Common.pSBC(-0.4, color)
          //   console.log(`Changed ${color} to ${newColor} | distance: ${distance}`)
          //   return newColor
          // }
          // else {
          let newColor = Common.pSBC(0.2, color)
          // console.log(`Changed ${color} to ${newColor} | distance: ${distance} | adjust: ${(0.02/distance)*100}`)
          return newColor
          // }
        }
      }
      // console.log(`Don't change ${color} | distance: ${distance}`)
      return color
    },
    FinalMessage() {
      let TempMessage = `${this.payload.parameters}`

      // TempMessage = twemoji.parse(TempMessage)

      let f_mes = Common.textToMessageObject(TempMessage)

      if (this.payload.tags.emotes) {
        let twitchEmotes = Common.parse_smiles(TempMessage, this.payload.tags["emotes"])
        for (const [em, url] of Object.entries(twitchEmotes)) {
          for (const i in f_mes) {
            if (f_mes[i].Text.slice(0, -1) == em) {
              f_mes[i].Type = "emote"
              f_mes[i].Text = url
              f_mes[i].ZeroWidth = false
            }
          }
        }
      }

      for (const em of this.Emotes) {
        for (const i in f_mes) {
          if (f_mes[i].Text.slice(0, -1) == em.Name) {
            f_mes[i].Type = "emote"
            f_mes[i].Text = this.EmotesBaseUrl[em.Type].replace('{0}', em.ID)
            f_mes[i].ZeroWidth = em.ZeroWidth
          }
        }
      }

      // for (let m of TempMessage.split(" ")) {
      //   m = m.trim()

      //   if (m == "") {
      //     continue
      //   }

      //   let tw_contains = false
      //   let tw_emote = []
      //   if (this.payload.tags.emotes) {
      //     let tw = Common.getEmoteTwitch(twitchEmotes, m)
      //     tw_contains = tw[0]
      //     tw_emote = tw[1]
      //   }

      //   let gl = Common.getEmote(this.Emotes, m)
      //   let gl_contains = gl[0]
      //   let gl_emote = gl[1]

      //   if (tw_contains == true && gl_contains == true) {
      //     tw_contains = false
      //   }

      //   switch (true) {
      //     case tw_contains:
      //       f_mes.push({"Type": "emote", "Text": tw_emote, "ZeroWidth": false})
      //       break;
          
      //     case gl_contains:
      //       if (gl_emote.ZeroWidth) {
      //         f_mes.push({"Type": "emote", "Text": this.EmotesBaseUrl[gl_emote.Type].replace('{0}', gl_emote.ID), "ZeroWidth": true})
      //       } else {
      //         f_mes.push({"Type": "emote", "Text": this.EmotesBaseUrl[gl_emote.Type].replace('{0}', gl_emote.ID), "ZeroWidth": false})
      //       }
      //       break;
        
      //     default:
      //       f_mes.push({"Type": "text", "Text": m+" "})
      //   }
      // }

      return f_mes
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
    filterText() {
      if (this.shadowText == "1") {
        return "drop-shadow(-1px 2px 1px #2b2b2b)"
      }
      return ""
    },
    filter() {
      try {
        return this.Paint.drop_shadows
        .map((v) => `drop-shadow(${v.x_offset}px ${v.y_offset}px ${v.radius}px ${Common.DecimalToStringRGBA(v.color)})`)
        .join(" ");
      } catch (error) {
        if (this.shadowText == "1") {
          return "drop-shadow(-1px 2px 1px #2b2b2b)"
        }
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
    height: v-bind(badgeSize);
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
    filter: v-bind('filterText');
  }

  .message-text img, .emoji {
    height: v-bind(emoteSize);
    vertical-align: middle;
    filter: unset;
  }
  .message-nick {
    font-weight: 700;

    background-size: cover;
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
