<template>
    <div class="ChatMessage">
      <div v-for="badge in Badges" :key="badge" class="Badge">
          <img :src="badge.Url">
      </div>
      <span>
      <span v-if="User.DisplayName.toLowerCase() == User.Login" class="message-nick" :style="{color: User.Color}">{{ User.DisplayName }}:</span>
      <span v-if="User.DisplayName.toLowerCase() != User.Login" class="message-nick" :style="{color: User.Color}">{{User.Login}} ({{ User.DisplayName }}):</span>
        <span class="message-text" v-html="FinalMessage"></span>
      </span>
    </div>
</template>

<script>

export default {
  name: 'ChatMessage',
  props: {
    Emotes: Array,

    Message: String, // raw message without emotes and etc.
    User: {
      Color: String,
      Login: String,
      DisplayName: String
    },
    Badges: Array,
  },
  computed: {
    FinalMessage() { // message with emotes and etc.
      let TempMessage = ` ${this.Message} `
      this.Emotes.forEach(key => {
        while (TempMessage.includes(` ${key.Name} `)) {
          TempMessage = TempMessage.replace(` ${key.Name} `, ` <img src="${key.Url}" class="Emote"> `)
        }
      });
      return TempMessage
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
    width: 18px;
    vertical-align: text-top;
  }
  .ChatMessage {
    padding-top: 3px;
    padding-bottom: 3px;
    padding-left: 5px;

    min-height: 31px;

    width: 100%;

    display: inline-block;

    background: rgb(43, 43, 43);
    color: white;
    font-size: 18px;
    border-bottom: 2px solid black;
  }
  .message-text {
    bottom: 5px;
  }
  .message-text img {
    height: 32px;
    vertical-align: middle;
  }
  .message-nick {
    font-weight: 900;
  }
</style>
