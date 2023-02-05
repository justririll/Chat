// import common from '@/methods/common.js'

// @todo: сделать таймаут на получение всякой хуеты если произошла ошибка кроме 404

var Huita = {
    async getUserID(channel) {
        const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${channel}`)
        if (response.ok) {
            console.log("IVR API successful, getting user-id...")
            const json = await response.json()
            return json[0].id
        }
        throw "Unable to get user id from ivr API!"
    },
    async getGlobalBadges() {
        try {
            let badges = {}

            const response = await fetch("https://badges.twitch.tv/v1/badges/global/display?language=en")
            const json = await response.json()
            for (const [key, value] of Object.entries(json["badge_sets"])) {
                let vers = value["versions"]
                let finalVersions = {}
                for (const [key, value] of Object.entries(vers)) {
                    finalVersions[key] = value["image_url_2x"]
                }
                badges[key] = finalVersions
              }
            return badges
        } catch (error) {
            console.log(`Unable to get global badges: ${error}`)
            return {}
        }
    },
    async getSubscriberBadges(user_id) {
            let subscriber = {}

            const response = await fetch(`https://badges.twitch.tv/v1/badges/channels/${user_id}/display`)
            const json = await response.json()
            if (response.ok) {
                let vers = json["badge_sets"]["subscriber"]["versions"]
                let finalVersions = {}
                for (const [key, value] of Object.entries(vers)) {
                    finalVersions[key] = value["image_url_2x"]
                }
                subscriber = finalVersions
            }
            return subscriber
    },
    async get7tvBadgesPaints() {
        try {
            let badges = []
            let paints = []

            const response = await fetch(`https://api.7tv.app/v2/badges?user_identifier=twitch_id`)
            const json = await response.json()
            for (const value of json["badges"]) {
                badges.push({"Users": value.users, "Url": value.urls[1][1]})
            }
            for (const value of json["paints"]) {
                paints.push(value)
            }
            return [badges, paints]
        } catch (error) {
            console.log(`Unable to get 7tv badges: ${error}`)
            return []
        }
    },
    async get7tvEmotes(user_id) {
        try {
            let emotes = []

            const response = await fetch(`https://7tv.io/v3/users/twitch/${user_id}`)
            const json = await response.json()
            for (const value of json["emote_set"]["emotes"]) {
                emotes.push({"Name": value.name, "ID": value.id, "Type": "7TV", "ZeroWidth": value.flags == 1})
            }
            return [emotes, json["emote_set"]["id"]]
        } catch (error) {
            console.log(`Unable to get 7tv channel emotes: ${error}`)
            return []
        }
    },
    async get7tvGlobalEmotes() {
        try {
            let emotes = []

            const response = await fetch(`https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857`)
            const json = await response.json()
            for (const value of json["emotes"]) {
                emotes.push({"Name": value.name, "ID": value.id, "Type": "7TV", "ZeroWidth": value.flags == 1})
            }
            return emotes
        } catch (error) {
            console.log(`Unable to get 7tv global emotes: ${error}`)
            return []
        }
    },
    async getBttvEmotes(user_id) {
        try {
            let emotes = []
            const response = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${user_id}`)
            const json = await response.json()
            if (json["sharedEmotes"]) {
                for (const value of json["sharedEmotes"]) {
                    emotes.push({"Name": value.code, "ID": value.id, "Type": "BTTV"})
                }
            }
            if (json["channelEmotes"]) {
                for (const value of json["channelEmotes"]) {
                    emotes.push({"Name": value.code, "ID": value.id, "Type": "BTTV"})
                }
            }
            return emotes
        } catch (error) {
            console.log(`Unable to get bttv emotes: ${error}`)
            return []
        }
    },
    async getBttvGlobalEmotes() {
        try {
            let emotes = []

            const response = await fetch(`https://api.betterttv.net/3/cached/emotes/global`)
            const json = await response.json()
            for (const value of json) {
                emotes.push({"Name": value.code, "ID": value.id, "Type": "BTTV"})
            }
            return emotes
        } catch (error) {
            console.log(`Unable to get bttv global emotes: ${error}`)
            return []
        }
    },
    async getFfzEmotes(channel) {
        try {
            let emotes = []

            const response = await fetch(`https://api.frankerfacez.com/v1/room/${channel}`)
            const json = await response.json()
            for (const value of json["sets"][json["room"]["set"].toString()]["emoticons"]) {
                emotes.push({"Name": value.name, "ID": value.id, "Type": "FFZ"})
            }
            return emotes
        } catch (error) {
            console.log(`Unable to get FFZ emotes: ${error}`)
            return []
        }
    },
    async getFfzGlobalEmotes() {
        try {
            let emotes = []

            const response = await fetch(`https://api.frankerfacez.com/v1/set/global`)
            const json = await response.json()
            for (const value of json["sets"]["3"]["emoticons"]) {
                emotes.push({"Name": value.name, "ID": value.id, "Type": "FFZ"})
            }
            return emotes
        } catch (error) {
            console.log(`Unable to get FFZ emotes: ${error}`)
            return []
        }
    },
    // @todo: ffz badges, bttv badges. Maybe add chatterino badges.
}

export default Huita