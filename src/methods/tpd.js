var Huita = {
    async getGlobalBadges() {
        try {
            let badges = {}

            const response = await fetch("https://badges.twitch.tv/v1/badges/global/display?language=en")
            const json = await response.json()
            for (const [key, value] of Object.entries(json["badge_sets"])) {
                let vers = value["versions"]
                let finalVersions = {}
                for (const [key, value] of Object.entries(vers)) {
                    finalVersions[key] = value["image_url_1x"]
                }
                badges[key] = finalVersions
              }
            return badges
        } catch (error) {
            console.log(`Unable to get global badges: ${error}`)
        }
    },
    async getSubscriberBadges(user_id) {
        // https://badges.twitch.tv/v1/badges/channels/{user_id}/display
            let subscriber = {}

            const response = await fetch(`https://badges.twitch.tv/v1/badges/channels/${user_id}/display`)
            const json = await response.json()
            let vers = json["badge_sets"]["subscriber"]["versions"]
            let finalVersions = {}
            for (const [key, value] of Object.entries(vers)) {
                finalVersions[key] = value["image_url_1x"]
            }
            subscriber = finalVersions
            return subscriber
    }
    // @todo: 7tv channel & global emotes, 7tv badges, ffz channel & global emotes, ffz badges, bttv channel & global emotes,
    // bttv badges. Maybe add chatterino badges.

}

export default Huita