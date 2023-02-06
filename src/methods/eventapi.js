

class EventAPI {
    constructor(set_id, user_id, onDelete, onAdd, onRename) {
        this.ws = null
        this.set_id = set_id
        this.user_id = user_id //user_id
        this.onDelete = onDelete
        this.onAdd = onAdd
        this.onRename = onRename
    }

    Connect() {
        this.ws = new WebSocket("wss://events.7tv.io/v3");
        this.ws.onmessage = (e) => this.onMessage(e)
    }

    subscribeToEvent(event, cond) {
        let message = {
            "op": 35,
            "d": {
                "type": event,
                "condition": cond
            }
        }
        this.ws.send(JSON.stringify(message))
    }

    onMessage(e) {
        let json = JSON.parse(e.data)
        // console.log(json)
        switch (json.op) {
            case 1: {
                this.subscribeToEvent("emote_set.*", {"object_id": this.set_id})
                //other
                const cond = {
                    "id": this.user_id,
                    "ctx": "channel",
                    "platform": "TWITCH"
                }
                this.subscribeToEvent("emote_set.*", cond)
                // this.subscribeToEvent("cosmetic.*", cond)
                // this.subscribeToEvent("cosmetic.*", {
                //     "id": "407046453",
                //     "ctx": "user",
                //     "platform": "TWITCH"
                // })
                break
            }
            case 0:
                switch (json.d.type) {
                    case "emote_set.update":
                        if (json.d.body.pulled) {
                            for (const item of json.d.body.pulled) {
                                this.onDelete(item)
                                break;
                            }
                        }
                        if (json.d.body.pushed) {
                            for (const item of json.d.body.pushed) {
                                this.onAdd(item)
                                break;
                            }
                        }
                        if (json.d.body.updated) {
                            for (const item of json.d.body.updated) {
                                this.onRename(item)
                                break;
                            }
                        }
                }
                // че то произошло

        }
    }
}

export default EventAPI