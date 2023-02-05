
var Common = {
    DecimalToStringRGBA(num) {
        const r = (num >>> 24) & 0xff;
        const g = (num >>> 16) & 0xff;
        const b = (num >>> 8) & 0xff;
        const a = num & 0xff;
    
        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    },
    parse_smiles(message, smiles){
        let result = {}
        message = message.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, 'a');
        for (const [i,k] of Object.entries(smiles)) {
          let smile
          if (parseInt(k[0]["endPosition"]) - k[0]["startPosition"] == 1){
            console.log("123")
            smile = message.substring(k[0]["startPosition"], parseInt(k[0]["endPosition"])+2).trim()
            console.log(smile)
          }
          else {
            smile = message.substring(parseInt(k[0]["startPosition"]), parseInt(k[0]["endPosition"])+2).trim()
          }
          smile = smile.split(" ")[0]
          if (!(smile in result)){
            result[smile] = `https://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/2.0`
          }
        }
        return result
    }
}

export default Common