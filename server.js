//Glitch Project
const express = require("express");
const https = require("https");
const app = express();
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const moment = require("moment");
const cc = 'KJ0UUFNHWBJSE-WE4GFT-W4VG'
//Discord
const Discord = require("discord.js");
const { WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, } = Discord;
const myIntents = new Intents();

myIntents.add(
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES
);
const client = new Client({ intents: myIntents, partials: ["CHANNEL"] });

//Env
const token = process.env.SECRET;
let listen

async function startApp() {
  console.log("Starting...");
  if (client.user) return console.log("User already logged in.")
  if (cc !== process.env.CC) return console.error("Discord bot login | Invalid CC");
  let promise = client.login(token)
  promise?.catch(function (error) {
    console.error("Discord bot login | " + error);
    process.exit(1);
  });
}
startApp();

client.on("debug", async function (info) {
  let status = info.split(" ");
  if (status[2] === `429`) {
    console.log(`info -> ${info}`); //debugger
    console.log(`Caught a 429 error!`);
    await sleep(60000)
  }
});
//When bot is ready
client.on("ready", async () => {
  console.log(client.user.id)
  if (slashCmd.register) {
    let discordUrl = "https://discord.com/api/v10/applications/"+client.user.id+"/commands"
    let headers = {
      "Authorization": "Bot "+token,
      "Content-Type": 'application/json'
    }
    for (let i in slashes) {
      let json = slashes[i]
      await sleep(1000)
      let response = await fetch(discordUrl, {
        method: 'post',
        body: JSON.stringify(json),
        headers: headers
      });
      console.log(json.name+' - '+response.status)
    }
    for (let i in slashCmd.deleteSlashes) {
      await sleep(2000)
      let deleteUrl = "https://discord.com/api/v10/applications/"+client.user.id+"/commands/"+slashCmd.deleteSlashes[i]
      let deleteRes = await fetch(deleteUrl, {
        method: 'delete',
        headers: headers
      })
      console.log('Delete - '+deleteRes.status)
      }
  }
  console.log("Successfully logged in to discord bot.");
  client.user.setPresence(shop.bot.status);
});

module.exports = { client: client, getPerms, noPerms };

let listener = app.listen(process.env.PORT, function () {
  console.log("Not that it matters but your app is listening on port ",listener.address());
});

//Settings
const settings = require("./storage/settings_.js");
const { prefix, shop, colors, theme, commands, permissions, emojis } = settings;
//Functions
const get = require("./functions/get.js");
const { getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor } = get;
//Command Handler
const cmdHandler = require("./functions/commands.js");
const { checkCommand, isCommand, isMessage, getTemplate } = cmdHandler;
//Others
const others = require("./functions/others.js");
const { makeCode, fetchKey, ghostPing, sleep, moderate, getPercentage, randomTable, scanString, requireArgs, getArgs } = others;
//Roles Handler
const roles = require("./functions/roles.js");
const { getRole, addRole, removeRole, hasRole } = roles;
//Slash Commands
const slashCmd = require("./storage/slashCommands.js");
const { slashes } = slashCmd;
// Roblox
const robloxJs = require("./functions/roblox.js");
const { handler } = robloxJs;
/*
██████╗░███████╗██████╗░███╗░░░███╗░██████╗
██╔══██╗██╔════╝██╔══██╗████╗░████║██╔════╝
██████╔╝█████╗░░██████╔╝██╔████╔██║╚█████╗░
██╔═══╝░██╔══╝░░██╔══██╗██║╚██╔╝██║░╚═══██╗
██║░░░░░███████╗██║░░██║██║░╚═╝░██║██████╔╝
╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═════╝░*/
async function getPerms(member, level) {
  let highestPerms = null;
  let highestLevel = 0;
  let sortedPerms = await permissions.sort((a, b) => b.level - a.level);
  for (let i in sortedPerms) {
    if (permissions[i].id === member.id && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? ((highestPerms = permissions[i]), (highestLevel = permissions[i].level)) : null;
    } else if ( member.user && member.roles.cache.some((role) => role.id === permissions[i].id) && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? ((highestPerms = permissions[i]), (highestLevel = permissions[i].level)) : null;
    }
  }

  if (highestPerms) return highestPerms;
}
async function guildPerms(message, perms) {
  //console.log(Permissions.FLAGS)
  if (message.member.permissions.has(perms)) return true
  
  let embed = new MessageEmbed()
  .addFields({name: "Insufficient Permissions",value: "You don't have the required server permissions to use this command.\n\n`"+perms.toString().toUpperCase()+"`"})
  .setColor(colors.red);
  
  message.channel.send({ embeds: [embed] });
}
function noPerms(message) {
  let Embed = new MessageEmbed()
    .setColor(colors.red)
    .setDescription("You lack special permissions to use this command.");
  return Embed;
}

/*
░█████╗░██╗░░░░░██╗███████╗███╗░░██╗████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗
██╔══██╗██║░░░░░██║██╔════╝████╗░██║╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝
██║░░╚═╝██║░░░░░██║█████╗░░██╔██╗██║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░
██║░░██╗██║░░░░░██║██╔══╝░░██║╚████║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░
╚█████╔╝███████╗██║███████╗██║░╚███║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗
░╚════╝░╚══════╝╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝*/
//ON CLIENT MESSAGE
let errors = 0;
let expCodes = [];
let nitroCodes = []
client.on("messageCreate", async (message) => {
  //
  if (message.author.bot) return;
}); //END MESSAGE CREATE

let yay = true
let cStocks = 0
let tStocks = 0

client.on("interactionCreate", async (inter) => {
  if (inter.isCommand()) {
    let cname = inter.commandName
    
    if (cname === 'setrank') {
      if (!await getPerms(inter.member, 5)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      let groupId;
      const options = inter.options._hoistedOptions;
      const username = options.find(a => a.name === 'username');
      const rank = options.find(a => a.name === 'rank');
      const group = options.find(a => a.name === 'group');
      groupId = group.value
      
      await inter.deferReply();
      
      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: '```diff\n- '+user.error+"```" })
      let role = await handler.getUserRole(groupId,user.id)
      if (role.error) return inter.editReply({ content: '```diff\n- '+user.error+"```" })
      // Get group roles to find the target role
      let groupRoles = await handler.getGroupRoles(groupId)
      let targetRole = groupRoles.roles.find(r => r.name.toLowerCase().includes(rank.value.toLowerCase()));
      
      if (!targetRole) return inter.editReply({ content: `Rank does not exist: ${rank.value}` });
      console.log('Target role:', targetRole);
      // Function to update the rank
      let updateRank = await handler.changeUserRank({groupId: groupId, userId: user.id, roleId: targetRole.id})
      
      if (updateRank.status !== 200) return inter.editReply({ content: emojis.warning+" Cannot change rank:\n```diff\n- "+updateRank.statusText+"```" });
      
      // Get thumbnail and send response
      let thumbnail = await handler.getUserThumbnail(user.id)
      let foundGroup = await handler.getGroup(groupId)
      
      let embed = new MessageEmbed()
      .setThumbnail(thumbnail)
      .addFields(
        { name: "User", value: "`Display Name` • "+user.displayName+"\n`Name` • "+user.name },
        { name: "Group", value: "`ID` • "+foundGroup.id+"\n`Name` • "+foundGroup.name },
        { name: "Previous Rank", value: `\`\`\`diff\n- ${role.name}\`\`\`` },
        { name: "Updated Rank", value: `\`\`\`diff\n+ ${targetRole.name}\`\`\`` }
      )
      .setColor(colors.none);

      await inter.editReply({ content: emojis.check+' Rank Updated', embeds: [embed] });
    }
    else if (cname === 'accept') {
      if (!await getPerms(inter.member, 5)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      let groupId;
      const options = inter.options._hoistedOptions;
      const username = options.find(a => a.name === 'username');
      const group = options.find(a => a.name === 'group');
      console.log(group)
      groupId = group.value
      await inter.deferReply();
      
      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: '```diff\n- '+user.error+"```" })
      
      let accept = await handler.acceptUser(groupId,user.id)
      
      if (accept.status !== 200) return inter.editReply({ content: emojis.warning+" Cannot accept user to the group:\n```diff\n- "+accept.statusText+"```" });
      
      // Get thumbnail and send response
      let thumbnail = await handler.getUserThumbnail(user.id)
      let foundGroup = await handler.getGroup(groupId)
      
      let embed = new MessageEmbed()
      .setThumbnail(thumbnail)
      .addFields(
        { name: "User", value: "`Display Name` • "+user.displayName+"\n`Name` • "+user.name },
        { name: "Group", value: "`ID` • "+foundGroup.id+"\n`Name` • "+foundGroup.name },
      )
      .setColor(colors.none)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()})

      await inter.editReply({ content: emojis.check+' '+user.name+' was accepted to the group', embeds: [embed] });
    }
    else if (cname === 'kick') {
      if (!await getPerms(inter.member, 5)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      let groupId;
      const options = inter.options._hoistedOptions;
      const username = options.find(a => a.name === 'username');
      const group = options.find(a => a.name === 'group');
      groupId = group.value
      await inter.deferReply();
      
      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: '```diff\n- '+user.error+"```" })
      
      let kick = await handler.kickUser(groupId,user.id)
      
      if (kick.status !== 200) return inter.editReply({ content: emojis.warning+" Cannot kick user from the group:\n```diff\n- "+kick.statusText+"```" });
      
      // Get thumbnail and send response
      let thumbnail = await handler.getUserThumbnail(user.id)
      let foundGroup = await handler.getGroup(groupId)
      
      let embed = new MessageEmbed()
      .setThumbnail(thumbnail)
      .addFields(
        { name: "User", value: "`Display Name` • "+user.displayName+"\n`Name` • "+user.name },
        { name: "Group", value: "`ID` • "+foundGroup.id+"\n`Name` • "+foundGroup.name },
      )
      .setColor(colors.none)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()})

      await inter.editReply({ content: emojis.check+' '+user.name+' was kicked from the group', embeds: [embed] });
    }
  }
  else if (inter.isButton()) {
    let id = inter.customId;
    if (id.startsWith("reply-")) {
      let reply = id.replace("reply-", "");
      inter.reply({ content: "*" + reply + "*", ephemeral: true });
    } 
    else if (id.startsWith("none")) {
      inter.deferUpdate();
    }
  }
});
process.on('unhandledRejection', async error => {
  ++errors
  console.log(error);
  let caller_line = error.stack.split("\n");
  let index = await caller_line.find(b => b.includes('/app'))
  let embed = new MessageEmbed()
  .addFields(
    {name: 'Caller Line', value: '```'+(index ? index : 'Unknown')+'```', inline: true},
    {name: 'Error Code', value: '```css\n[ '+error.code+' ]```', inline: true},
    {name: 'Error', value: '```diff\n- '+(error.stack >= 1024 ? error.stack.slice(0, 1023) : error.stack)+'```'},
  )
  .setColor(colors.red)
  
  try {
    let channel = await getChannel(shop.channels.output)
    channel ? channel.send({embeds: [embed]}).catch(error => error) : null
  } catch (err) {
    console.log(err)
  }
});

let ready = true;
const interval = setInterval(async function() {
  //Get time
  let date = new Date().toLocaleString("en-US", { timeZone: 'Asia/Shanghai' });
  let today = new Date(date);
  let hours = (today.getHours() % 12) || 12;
  let state = today.getHours() >= 12 ? 'PM' : 'AM';
  let day = today.getDay();
  let time = hours +":"+today.getMinutes()+state;
  //Get info
  if (ready) {
    ready = false
    if (!ready) {
      setTimeout(function() {
        ready = true;
      },60000)
    }
    let template = await getChannel(shop.channels.templates)
    let guild = await getGuild(shop.guild)
    let channel = await getChannel('1')
        
    if (time === '30:0PM') {
      ready = false
      let msg = await template.messages.fetch("1131863357083881522")
      channel.send({content: msg.content})
    }
  }
  
  if (!ready) {
    setTimeout(function() {
      ready = true
    },50000)
  }
  
  },5000)