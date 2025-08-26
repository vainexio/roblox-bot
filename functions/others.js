const {getPerms, noPerms, client} = require('../server.js');
const Discord = require('discord.js');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = Discord;

const sendMsg = require('../functions/sendMessage.js')
const sendChannel = sendMsg.sendChannel
const sendUser = sendMsg.sendUser

const settings = require('../storage/settings_.js')
const {shop, emojis, colors, theme, status} = settings

const cmdHandler = require('../functions/commands.js')
const {getTemplate} = cmdHandler

const get = require('../functions/get.js')
const {getRandom, getChannel} = get

const makeButton = async function (id, label, style, emoji) {
  //emoji = emoji ? emoji : ''
  style = style.toUpperCase()
  let button = new MessageButton()
				.setLabel(label)
				.setStyle(style.toUpperCase())
  
  if (style === 'LINK') {
    button = new MessageButton(button)
    .setURL(id)
  }
  else {
    button = new MessageButton(button)
    .setCustomId(id)
  }
  if (emoji) {
    button = new MessageButton(button)
    .setEmoji(emoji)
  }
  
  const row = new MessageActionRow()
			.addComponents(
        button
        );
  return button;
}
const makeRow = async function (id, label, style, emoji) {
  //emoji = emoji ? emoji : ''
  style = style.toUpperCase()
  let button = new MessageButton()
				.setLabel(label)
				.setStyle(style.toUpperCase())
  
  if (style === 'LINK') {
    button = new MessageButton(button)
    .setURL(id)
  }
  else {
    button = new MessageButton(button)
    .setCustomId(id)
  }
  if (emoji) {
    button = new MessageButton(button)
    .setEmoji(emoji)
  }
  
  const row = new MessageActionRow()
			.addComponents(
        button
        );
  return row;
}
module.exports = {
  makeCode: function (length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  stringJSON: function (jsobj) {
    var msg = '\```json\n{'
    for (var key in jsobj) {
      if (jsobj.hasOwnProperty(key)) {
        msg = msg + "\n \"" + key + "\": \"" + jsobj[key] + "\","
      }                       
    }
    msg = msg.substring(0, msg.length - 1)
    msg = msg + "\n}\`\`\`"
    return msg;
  },
  fetchKey: async function (channel, key, message) {
  
  let last_id;
  let foundKey = false
  let mentionsCount = 0
  let limit = 500
  let msgSize = 0
  let totalMsg = 0
  
  let embedMention = new MessageEmbed()
  .setDescription("No recent pings was found.")
  .setColor(colors.red)
  
  let msgBot
  await message.channel.send("Searching for reference code... "+emojis.loading).then((botMsg) => { msgBot = botMsg })
    
    while (true) {
      const options = { limit: 100 };
      if (last_id) {
        options.before = last_id;
      }
      
      let messages = await channel.messages.fetch(options).then(messages => {
      
      last_id = messages.last().id;
      totalMsg += messages.size
      msgSize = messages.size
        
        messages.forEach(async (gotMsg) => {
          if (gotMsg.content.toLowerCase().includes(key.toLowerCase()) && gotMsg.author.id === client.user.id) {
            mentionsCount += 1
            let row = new MessageActionRow().addComponents(
              new MessageButton().setLabel('Jump to Message').setURL(gotMsg.url).setStyle('LINK')
            );
            message.reply({content: emojis.check+' Reference code was found.', components: [row]})
            foundKey = true
          }
        })
      });
      //Return
      if (foundKey || await msgSize != 100) {
        msgBot.delete();
        if (!foundKey) message.channel.send(emojis.x+" No key was found `"+key+"`.")
        break;
      }
    }
  },
  sleep: async function (miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
  },
  moderate: function(member,perms) {
    if (perms) return;
    let customPres = member.presence?.activities.find(a => a.id === 'custom')
    if (customPres && (customPres.state?.toLowerCase().includes('sale') || customPres.state?.toLowerCase().includes('php') || customPres.state?.toLowerCase().includes('₱') || customPres.state?.toLowerCase().includes('p') || customPres.state?.toLowerCase().includes('fs') || customPres.state?.toLowerCase().includes('sell')) && (customPres.state?.toLowerCase().includes('nitro') || customPres.state?.toLowerCase().includes('nb'))) {
      if (!member.nickname?.startsWith('ω.')) member.setNickname('ω. '+member.user.username.replace(/ /g,'')).catch(err => err)
      return true;
    }
  },
  getPercentage: function(value, totalValue) {
    value = Number(value)
    totalValue = Number(totalValue)
    let percentage = Math.round((value/totalValue)*100)
    return percentage;
  },
  getPercentageBar: function (value, totalValue, bodyCount = 8) {
    // emojis (exact IDs you provided)
    const FILLED_TAIL = '<:filled_tail:1409844139587272754>';
    const FILLED_BODY = '<:filled_body:1409844133794680942>';
    const FILLED_HEAD = '<:filled_head:1409844131496333324>';

    const EMPTY_TAIL = '<:empty_tail:1409844136588083271>';
    const EMPTY_BODY = '<:empty_body:1409844126840655914>';
    const EMPTY_HEAD = '<:empty_head:1409844129495646358>';

    // Normalize numeric inputs
    const num = Number(value) || 0;
    const den = Number(totalValue) || 0;

    // Handle divide-by-zero: treat as 0%
    const rawPct = den > 0 ? (num / den) * 100 : 0;
    // clamp between 0 and 100 and round to integer percent
    const pct = Math.max(0, Math.min(100, Math.round(rawPct)));

    // number of filled bodies based on percentage and bodyCount
    const filledBodies = Math.round((pct / 100) * bodyCount);

    // choose tail: filled if at least one body is filled (you can change to pct>0 if desired)
    const tail = filledBodies > 0 ? FILLED_TAIL : EMPTY_TAIL;

    // bodies: filled first, then empty for the remainder
    const bodies =
      FILLED_BODY.repeat(filledBodies) + EMPTY_BODY.repeat(Math.max(0, bodyCount - filledBodies));

    // head: filled only when fully filled (100%)
    const head = filledBodies === bodyCount ? FILLED_HEAD : EMPTY_HEAD;

    // return both the bar string and the computed percentage
    return {
      bar: tail + bodies + head,
      percentage: pct
    };
  },
  randomTable: function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
},
  //Scan String For Key
  scanString: function (string,key) {
  string = string.toLowerCase()
  key = key.toLowerCase()
if (string.includes(key)) {
  return true;
}
},
  //ARGS
  requireArgs: async function (message,count) {
  var args = message.content.trim().split(/\n| /);
if (!args[count]) {
  let template = await getTemplate(args[0], await getPerms(message.member,0))
  sendChannel(template,message.channel.id,theme)
  return null;
} else {
  return args;
}
},
  getArgs: function (content) {
  var args = content.trim().split(/\n| /);
  return args;
},
  makeButton: makeButton,
  makeRow: makeRow,
  ghostPing: async function(id,ch) {
    let channel = await getChannel(ch)
    
    await channel.send('<@'+id+'>').then(msg => msg.delete())
  }
};