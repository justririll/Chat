<template>
<div id="main">
    <div class="example-chat">
      <div id="chat">
        <ChatMessage v-for="mes in Messages" :key="mes"
          :Emotes="Emotes" :Paints="Paints" :GlobalBadges="Badges"
          :payload="mes" :BG="mes.BG" :paintsEnabled="paintsEnabled" 
          :font_size="fontSize" :interpolateSize="interpolateSize"/>
      </div>
    </div>
</div>
</template>

<script>
import ChatMessage from '@/components/ChatMessage_example.vue'

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

        // Messages: [this.generateMessage("zhestykey", "zhestykey", "forsenPls", 0, "#2E8B57", "123"), this.generateMessage("juuuuuustriiiiiiriiiiiill", "juuuuuustriiiiiiriiiiiill", "))", 1, "#63F07E", "407046453")],
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
      generateMessage(nickname, displayName, message, bg, color, userid) {
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
            "BG": ["#2b2b2b", "#242424"][bg]
        }
      }
    }
}
</script>

<style>
  .example-chat {
    position: relative;
    max-width: 35vw;
    max-height: 10vht;
    left: 35vw;

    margin-top: 30vh;
  }
  #main {
    width: 100%;
    height: 100%;

    position: fixed;
    top: 0;
    left: 0;
    
    background: rgb(46, 46, 46);
    color: white;
  }
</style>