
var chat = {
      parseMessage(e) {
        let message = e.data.toString().split('\n');
            const ircRegex = /^(?:@([^ ]+) )?(?:[:](\S+) )?(\S+)(?: (?!:)(.+?))?(?: [:](.+))?$/;
			const tagsRegex = /([^=;]+)=([^;]*)/g;
			const badgesRegex = /([^,]+)\/([^,]*)/g;
			const emotesRegex = /([^]+):([^]*)/g;
			const emoteIndexRegex = /([^,]+)-([^,]*)/g;
			const actionRegex = /^\u0001ACTION (.*)\u0001$/g;
			const hostRegex = /([a-z_0-9]+)!([a-z_0-9]+)@([a-z._0-9]+)/;
            let payload = {
                    tags: {},
                    command: false,
                    message: '',
                    raw: message[x]
            }
            for (var x=0;x<message.length;x++) {
                if (message[x].length == 0) {
                    return;
                }
                const data = ircRegex.exec(message[x].trim());
                if (data === null) {
                    console.error(`Couldnt parse message '${message[x]}'`);
                    return;
                }
                // items
                // 0 is unparsed message
                // 1 ircV3 tags
                // 2 tmi.twitch.tv
                // 3 COMMAND
                // 4 Room
                // 5 rest/message
                // 0 ignore
                // 1 tags
                let tagdata = data[1] ? data[1] : false;
                if (tagdata) {
                    let m;
                    do {
                        m = tagsRegex.exec(tagdata);
                        if (m) {
                            // unparsed, a, b
                            const [, key, val] = m;
                            // interrupts
                            switch (key) {
                                case 'badges':
                                case 'badge-info': {
                                    payload.tags[key] = {};
                                    let b;
                                    do {
                                        b = badgesRegex.exec(val);
                                        if (b) {
                                            const [, badge, tier] = b;
                                            payload.tags[key][badge] = tier;
                                        }
                                    } while (b);
                                    break;}
                                case 'emotes': {
                                    payload.tags[key] = {};
                                    let e;
                                    do {
                                        e = emotesRegex.exec(val);
                                        if (e) {
                                            const [, emoteID, indices] = e;
                                            // and split again
                                            let em;
                                            do {
                                                em = emoteIndexRegex.exec(indices);
                                                if (em) {
                                                    const [, startIndex, endIndex] = em;
                                                    // arrays!
                                                    if (!payload.tags[key][emoteID]) {
                                                        payload.tags[key][emoteID] = new Array();
                                                    }
                                                    payload.tags[key][emoteID].push({
                                                        startIndex,
                                                        endIndex
                                                    });
                                                }
                                            } while (em);
                                        }
                                    } while (e);
                                    break;}
                                default:
                                    payload.tags[key] = val.replace(/\\s/g, ' ').trim();// for \s (space)
                                    //// dupe - keys for ease
                                    //if (key.indexOf('-') >= 0) {
                                    //    let dupeKey = key.replace(/-/g, '_');
                                    //    payload.tags[dupeKey] = val.replace(/\\s/g, ' ').trim();// for \s (space)
                                    //}
                            }
                        }
                    } while (m);
                }
                let host = hostRegex.exec(data[2]);
                payload.user = false;
                if (host != null) {
                    payload.user = host[1];
                }
                payload.command = data[3];
                payload.room = data[4];
                payload.message = data[5];
                payload.action = false;
                const actionCheck = actionRegex.exec(payload.message);
                if (actionCheck != null) {
                    payload.action = true;
                    payload.message = actionCheck[1];
                }
                break
            }
        return payload
      },
}

export default chat