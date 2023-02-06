<template>
<div id="main">
    <div class="logo">
      <img src="https://cdn.7tv.app/emote/620a09e68d6b23e0d044ce69/4x.webp" draggable="false">
      <br>
      This page is currently under development
      <br>
      Эта страница находится в разработке
    </div>

    <br>
    <div class="setting">
        <div class="setting-name">Channel name</div>
        <input type="text" :value="Channel" @change="onChangeChannel">
    </div>
    <div class="setting">
        <div class="setting-name">Font size</div>
        <input type="number" :value="fontSize" min="8" max="50" @change="onChangeFontSize">
    </div>
    <div class="setting">
        <div class="setting-name">Background color</div>
        <input type="text" :value="Background" @change="onChangeBackground">
    </div>
    <div class="setting">
        <div class="setting-name">Enable 7TV paints</div>
        <input class="checkbox" type="checkbox" @change="onChangePaints" checked>
    </div>

    <div class="example-chat">
      <div id="chat">
        <ChatMessage v-for="mes in Messages" :key="mes"
          :Emotes="Emotes" :Paints="Paints" :GlobalBadges="Badges"
          :payload="mes" :BG="BGS[mes.BG]" :paintsEnabled="paintsEnabled" 
          :font_size="fontSize" :interpolateSize="interpolateSize"/>
      </div>
    </div>
    <div class="out">
      <div class="setting-name">Your URL:</div>
      <input class="out_url" type="text" :value="out_url" readonly>
    </div>
</div>
</template>

<script>
import ChatMessage from '@/components/ChatMessage_example.vue'
import Common from '@/methods/common'

export default {
    name: 'main-page',
    components: {
      ChatMessage
    },
    data() {
      return {
        paintsEnabled: "1",
        fontSize: "18",
        interpolateSize: "1",
        Channel: "",
        Background: "#2b2b2b",

        Messages: [this.generateMessage("i0uz", "I0uz", "forsenPls", 0, "#59D9FF", "123"), this.generateMessage("juuuuuustriiiiiiriiiiiill", "ㅿ4ㅿ3ㅿ2ㅿ1ㅿ2ㅿ3ㅿ4", "))", 1, "#FFFFFF", "407046453")],
        Emotes: [{"Name": "forsenPls", "Type": "7TV", "ID": "603cacd216b3f90014d31852"}, {"Name": "))", "Type": "7TV", "ID": "63a05045ac1cf3ca937e4beb"}],
        Badges: {"vip": {
                    "1": "https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/2"
                },
                "game-developer": {
                    "1": "https://static-cdn.jtvnw.net/badges/v1/85856a4a-eb7d-4e26-a43e-d204a977ade4/2"
                }},
        Paints: [{
                "id": "6387708e11dfd13a4213f283",
                "name": "Gluhwein Time",
                "users": [
                    "407046453"
                ],
                "function": "linear-gradient",
                "color": null,
                "stops": [
                    {
                        "at": 0,
                        "color": 1443302655
                    },
                    {
                        "at": 0.49,
                        "color": -1891813121
                    },
                    {
                        "at": 0.94,
                        "color": -273147905
                    },
                    {
                        "at": 1,
                        "color": -103064321
                    },
                    {
                        "at": 1,
                        "color": -103064321
                    }
                ],
                "repeat": false,
                "angle": 90,
                "shape": "circle",
                "drop_shadows": [
                    {
                        "x_offset": 0,
                        "y_offset": 0,
                        "radius": 1,
                        "color": -1891813121
                    }
                ]
            }],
      }
    },
    methods: {
      generateMessage(nickname, displayName, message, currbg, color, userid) {
        return {
            "tags": {
                "badges": {
                    "vip": "1",
                    "game-developer": "1"
                },
                "color": color,
                "display-name": displayName,
                "user-id": userid,
            },
            "source": {
                "nick": nickname,
            },
            "command": {
                "command": "PRIVMSG",
            },
            "parameters": message,
            "BG": currbg
        }
      },
      onChangeFontSize(event) {
        if (parseInt(event.target.value) <= 50 && parseInt(event.target.value) >= 8) {
          this.fontSize = event.target.value
        }
      },
      onChangeChannel(event) {
        this.Channel = event.target.value
      },
      onChangeBackground(event) {
        if (event.target.value.length == 6 || event.target.value.length == 7) this.Background = event.target.value
      },
      onChangePaints() {
        this.paintsEnabled = this.paintsEnabled == "1" ? "0" : "1"
      }
    },
    computed: {
      out_url() {
        let additional_query = ""
        if (this.Channel != "") {
          if (this.fontSize != 18) additional_query += `&font_size=${this.fontSize}`

          if (this.Background != "#2b2b2b") additional_query += `&background=${this.BG.substring(1)}`

          if (this.paintsEnabled != "1") additional_query += `&paints=0`

          return `https://chat.justririll.com/#/chat?channel=${this.Channel}${additional_query}`
        }
        return `Enter channel to proceed!`
      },
      BG() {
        if (this.Background[0] == "#") {
          return this.Background
        }
        return "#" + this.Background
      },
      BG2() {
        let minus = 1
          let gray = Common.toGray(this.BG) 
          if (gray > 0.38) {
            minus = -30/gray
          }

          return Common.pSBC(0.01*minus, this.BG)
      },
      BGS() {
        return [this.BG, this.BG2]
      }
    }
}
</script>

<style>
  .logo {
    font-size: 14px;
    padding-top: 2vh;
    text-align: center;
  }
  .out_url {
    width: 80vw;
    height: 3vh;
    text-align: start;
  }
  .out {
    margin-left: 10vw;
    display: inline-block;
    padding-top: 20vh;
  }
  .example-chat {
    position: relative;
    max-width: 60vw;
    max-height: 10vh;
    left: 20vw;

    margin-top: 10vh;
  }
  #main {
    width: 100%;
    height: 100%;

    font-family: 'Roboto', sans-serif;

    position: fixed;
    top: 0;
    left: 0;
    
    background: rgb(46, 46, 46);
    color: white;
  }
  .setting-name {
    text-align: center;
  }
  .setting {
      width: 10vw;
      display: inline-block;
      margin-left: 10vw;
      padding-top: 5vh;
  }
  input {
      width: 10vw;
      height: 4vh;
      background-color: #494949;
      color: white;
      border: 1px solid black;
      border-radius: 8px;
      font-size: 24px;
      text-align: center;
  }
  .checkbox {
    width: 2vw;
    height: 2vh;
    margin-left: 4vw;
  }
</style>