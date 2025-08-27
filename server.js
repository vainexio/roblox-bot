// Project
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cc = 'KJ0UUFNHWBJSE-WE4GFT-W4VG'
app.use(bodyParser.json());

// Discord
const Discord = require("discord.js");
const { WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = Discord;
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

const link = "https://ad7738af-9b3f-473a-9150-5f394d2a14a7-00-3lsgrdmc5s7oz.riker.replit.dev/"
// Secrets
const token = process.env.SECRET;
const mongooseToken = process.env.MONGOOSE;

// Models
let usersSchema
let users

// Codes
const codesByCode = new Map();      // code -> { discordId, expiresAt }
const codeByDiscord = new Map();    // discordId -> code

// Config
const CODE_TTL_MS = 5 * 60 * 1000; // 10 minutes default (change as needed)
const VERIFY_SECRET = process.env.VERIFY_SECRET || null; // optional header secret for /verify
let stopFlow = false

// Utility: generate a 6-digit string, ensure uniqueness in codesByCode
function generate6DigitCode() {
  // try up to a few times to avoid collision
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    if (!codesByCode.has(code)) return code;
  }
  // fallback: extremely unlikely to happen, but if it does, linear scan
  let candidate = 100000;
  while (codesByCode.has(String(candidate))) candidate++;
  return String(candidate);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of codesByCode.entries()) {
    if (entry.expiresAt <= now) {
      codesByCode.delete(code);
      codeByDiscord.delete(entry.discordId);
    }
  }
}, 60 * 1000);

async function startApp() {
  console.log("Starting...");
  if (client.user) return console.log("User already logged in.")
  if (cc !== process.env.CC) return console.error("Discord bot login | Invalid CC");
  let promise = client.login(token)

  promise?.catch(function(error) {
    console.error("Discord bot login | " + error);
    process.exit(1);
  });
}
startApp();

client.on("debug", async function(info) {
  let status = info.split(" ");
  if (status[2] === `429`) {
    console.log(`info -> ${info}`);
    console.log(`Caught a 429 error!`);
    await sleep(60000)
  }
});

// Initializer
client.on("ready", async () => {
  console.log(client.user.id)
  await mongoose.connect(mongooseToken);

  usersSchema = new mongoose.Schema({
    robloxId: { type: String, unique: true, sparse: true },
    discordId: { type: String, unique: true, sparse: true },
    xp: { type: Number, default: 0 },
  });

  users = mongoose.model("PN_Users2", usersSchema);

  if (slashCmd.register) {
    let discordUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands"
    let headers = {
      "Authorization": "Bot " + token,
      "Content-Type": 'application/json'
    }
    for (let i in slashes) {
      await sleep(2000)
      let json = slashes[i]
      let response = await fetch(discordUrl, {
        method: 'post',
        body: JSON.stringify(json),
        headers: headers
      });
      console.log(json.name + ' - ' + response.status)
    }
    for (let i in slashCmd.deleteSlashes) {
      await sleep(2000)
      let deleteUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands/" + slashCmd.deleteSlashes[i]
      let deleteRes = await fetch(deleteUrl, {
        method: 'delete',
        headers: headers
      })
      console.log('Delete - ' + deleteRes.status)
    }
  }

  console.log("Successfully logged in to discord bot.");
  client.user.setPresence(config.bot.status);
});

module.exports = { client: client, getPerms, noPerms };

let listener = app.listen(process.env.PORT, function() {
  console.log("Not that it matters but your app is listening on port ", listener.address());
});

//Settings
const settings = require("./storage/settings_.js");
const { prefix, config, colors, theme, commands, permissions, emojis } = settings;
//Functions
const get = require("./functions/get.js");
const { getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor } = get;
//Command Handler
const cmdHandler = require("./functions/commands.js");
const { checkCommand, isCommand, isMessage, getTemplate } = cmdHandler;
//Others
const others = require("./functions/others.js");
const { makeCode, fetchKey, ghostPing, sleep, moderate, getPercentageBar, randomTable, scanString, requireArgs, getArgs } = others;
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
    } else if (member.user && member.roles.cache.some((role) => role.id === permissions[i].id) && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? ((highestPerms = permissions[i]), (highestLevel = permissions[i].level)) : null;
    }
  }

  if (highestPerms) return highestPerms;
}
async function guildPerms(message, perms) {
  //console.log(Permissions.FLAGS)
  if (message.member.permissions.has(perms)) return true

  let embed = new MessageEmbed()
    .addFields({ name: "Insufficient Permissions", value: "You don't have the required server permissions to use this command.\n\n`" + perms.toString().toUpperCase() + "`" })
    .setColor(colors.red);

  message.channel.send({ embeds: [embed] });
}
function noPerms() {
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
client.on("messageCreate", async (message) => {
  //
  if (message.author.bot) return;
  if (stopFlow) return;
  if (message.content == "killdis") {
    stopFlow = true
  }
}); //END MESSAGE CREATE

//

client.on("interactionCreate", async (inter) => {
  if (stopFlow) return;
  if (inter.isCommand()) {
    let cname = inter.commandName

    if (cname === 'setrank') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const usernameOpt = options.find(a => a.name === 'user');
      const rankOpt = options.find(a => a.name === 'rank');
      const group = config.groups[0];
      const groupId = group.groupId;

      if (!usernameOpt || !rankOpt) {
        return inter.reply({ content: emojis.warning + ' Missing required options.', ephemeral: true });
      }

      await inter.deferReply();

      // small helper to send failure and stop
      const fail = async (msg) => inter.editReply({ content: msg });

      try {
        const rawInput = String(usernameOpt.value).trim();

        // Detect Discord mention <@!id> or raw ID (17-20 digits)
        const mentionMatch = rawInput.match(/^<@!?(\d+)>$/);
        const rawDiscordIdMatch = !mentionMatch && rawInput.match(/^(\d{17,20})$/);

        let robloxUser; // will hold Roblox user object { id, name, displayName, ... }
        let dbUserRecord; // DB record for the linked robloxId (if any)

        if (mentionMatch || rawDiscordIdMatch) {
          // Resolve Discord user object using your existing getUser
          const discordIdentifier = mentionMatch ? mentionMatch[0] : rawDiscordIdMatch[1];
          const discordObj = await getUser(discordIdentifier);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Find linked robloxId in DB
          dbUserRecord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserRecord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1409919652494180362> command to link the account.");
          }

          // Get Roblox user by stored robloxId
          robloxUser = await handler.getUser(String(dbUserRecord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");
        } else {
          // Treat input as Roblox username or id
          robloxUser = await handler.getUser(rawInput);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Get or create DB record for this roblox user
          dbUserRecord = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUserRecord) {
            dbUserRecord = await users.create({ robloxId: String(robloxUser.id), xp: 0 });
          }
        }

        // Get the user's current role in the group
        const currentRoleRes = await handler.getUserRole(groupId, robloxUser.id);
        if (currentRoleRes.error) {
          return fail(emojis.warning + " **" + (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")** is not in the group.");
        }

        const currentRole = currentRoleRes; // expecting { id, name, rank, ... }

        // Fetch group roles and find the target role by name (case-insensitive substring)
        const groupRolesRes = await handler.getGroupRoles(groupId);
        if (!groupRolesRes || groupRolesRes.error) {
          return fail(emojis.warning + " Failed to fetch group roles. Try again later.");
        }

        const targetRole = (groupRolesRes.roles || []).find(r =>
          String(r.name).toLowerCase().includes(String(rankOpt.value).toLowerCase())
        );

        if (!targetRole) {
          return fail(`Rank does not exist: ${rankOpt.value}`);
        }

        // Attempt to change rank
        const updateRank = await handler.changeUserRank({ groupId: groupId, userId: robloxUser.id, roleId: targetRole.id });

        if (!updateRank || updateRank.status !== 200) {
          const statusText = updateRank?.statusText || (updateRank?.error ?? 'Unknown error');
          return fail(emojis.warning + " Cannot change rank:\n```diff\n- " + updateRank.status+": "+statusText + "```");
        }

        // Build response embed
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        const embed = new MessageEmbed()
          .setThumbnail(thumbnail)
          .setFooter({ text: "User ID: " + robloxUser.id })
          .setColor(colors.none)
          .addFields(
            { name: "User", value: (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")" },
            { name: "Updated Rank", value: `\`\`\`diff\n+ ${targetRole.name}\`\`\`` },
            { name: "Previous Rank", value: `\`\`\`diff\n- ${currentRole.name}\`\`\`` }
          );

        await inter.editReply({ content: emojis.check + ' Rank Updated', embeds: [embed] });
      } catch (err) {
        console.error('setrank handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }
    else if (cname === 'xp') {
      if (!await getPerms(inter.member, 3)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const type = options.find(a => a.name === 'type');
      const usernameOption = options.find(a => a.name === 'usernames'); // can be Roblox names or Discord mentions/IDs
      const amount = options.find(a => a.name === 'amount');
      const group = config.groups[0];
      const groupId = group.groupId;

      // initial reply while processing
      await inter.reply({ content: "-# " + emojis.loading });

      // parse usernames (comma separated)
      const usernames = String(usernameOption.value || "")
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

      const xpToChange = parseInt(amount.value, 10);
      if (isNaN(xpToChange) || xpToChange < 0) {
        return await inter.editReply({ content: emojis.warning + " Invalid amount." });
      }
      if (xpToChange > 20 && !await getPerms(inter.member, 4)) {
        return await inter.editReply({ content: emojis.warning + " Max XP to change is 20." });
      }

      // normalize action type
      const action = String(type?.value || "").toLowerCase(); // expecting "add" or "subtract"

      let processedCount = 0;

      for (const unameRaw of usernames) {
        const uname = String(unameRaw).trim();
        let user; // Roblox user object { id, name, displayName, ... }
        let dbUser; // DB user corresponding to robloxId

        try {
          // detect Discord mention like <@123...> or raw numeric discord id (17-20 digits)
          const mentionMatch = uname.match(/^<@!?(\d+)>$/);
          const rawIdMatch = !mentionMatch && uname.match(/^(\d{17,20})$/); // treat long numeric as a possible discord id

          if (mentionMatch || rawIdMatch) {
            // Resolve Discord user using your existing getUser (you said it returns the discord user object)
            const discordIdentifier = mentionMatch ? mentionMatch[0] : rawIdMatch[1];
            const discordObj = await getUser(discordIdentifier);
            if (!discordObj || discordObj.error) {
              await inter.channel.send({ content: emojis.warning + ` Failed to resolve Discord user for input \`${uname}\`.` });
              continue;
            }

            // find linked robloxId in DB
            const linked = await users.findOne({ discordId: String(discordObj.id) }).exec();
            if (!linked) {
              await inter.channel.send({ content: emojis.warning + ` This Discord account (${discordObj.username ?? discordObj.id}) is not linked to any Roblox account. Use </connect:1409919652494180362> to link.` });
              continue;
            }

            // fetch roblox user by stored robloxId
            user = await handler.getUser(String(linked.robloxId));
            if (user.error) {
              await inter.channel.send({ content: emojis.warning + ` Failed to fetch Roblox user for Discord ${discordObj.id}: ${user.error}` });
              continue;
            }

            // load the DB user record we will modify
            dbUser = linked;
          } else {
            // Treat as Roblox username or id (handler.getUser handles both username and numeric id)
            user = await handler.getUser(uname);
            if (user.error) {
              await inter.channel.send({ content: emojis.warning + ` Failed to fetch Roblox user \`${uname}\`: ${user.error}` });
              continue;
            }

            // get or create DB user
            dbUser = await users.findOne({ robloxId: user.id }).exec();
            if (!dbUser) {
              dbUser = await users.create({ robloxId: user.id, xp: 0 });
            }
          }

          // Final safety check
          if (!user || !user.id) {
            await inter.channel.send({ content: emojis.warning + ` Could not resolve Roblox user for input \`${uname}\`.` });
            continue;
          }

          // compute new XP
          let newXP = dbUser.xp ?? 0;
          if (action === 'add' || action === 'a') {
            newXP = (dbUser.xp ?? 0) + xpToChange;
          } else if (action === 'subtract' || action === 'sub' || action === 's') {
            newXP = (dbUser.xp ?? 0) - xpToChange;
            if (newXP < 0) newXP = 0;
          } else {
            await inter.channel.send({ content: emojis.warning + ` Invalid type for **${user.name}**. Use Add or Subtract.` });
            continue;
          }

          // save update
          dbUser.xp = newXP;
          await dbUser.save();

          // fetch thumbnail and roles
          const thumbnail = await handler.getUserThumbnail(user.id);
          const userRole = await handler.getUserRole(groupId, user.id) || {};
          if (userRole.error) {
            await inter.channel.send({ content: emojis.warning + " **" + (user.displayName ?? user.name) + " (@" + (user.name ?? "") + ")** is not in the group." });
            continue;
          }

          const groupRole = group.roles.find(r => r.id === userRole.id) || null;
          const nextRole = groupRole ? group.roles.find(r => r.rank === groupRole.rank + 1) : null;

          if (!nextRole || !nextRole.requiredXp) {
            await inter.channel.send({ content: emojis.warning + ` **${user.name}**'s rank cannot receive XP.` });
            continue;
          }

          let progress = getPercentageBar(dbUser.xp, groupRole.requiredXp);
          let emojiState = (action === 'add' || action === 'a') ? emojis.green : emojis.red;

          // Build embed
          const embed = new MessageEmbed()
            .setThumbnail(thumbnail)
            .setColor((action === 'add' || action === 'a') ? colors.green : colors.red)
            .setDescription(`${emojiState} ${action === 'add' ? 'Added' : 'Subtracted'} **${xpToChange} XP** to ${user.displayName} (@${user.name})`)
            .setFooter({ text: "User ID: " + user.id })
            .addFields(
              { name: "Discord", value: dbUser.discordId ? "<@" + dbUser.discordId + ">" : "Not Verified" },
              { name: "Current Rank", value: userRole.name || "Unknown" },
              { name: "Next Rank", value: nextRole.name + "\n" + progress.bar + " " + progress.percentage + "%\n-#  " + dbUser.xp + "/" + groupRole.requiredXp + " XP" },
            );

          // Send the embed to channel
          await inter.channel.send({ embeds: [embed] });

          // If user qualifies for promotion (preserve your original promotion logic)
          if (groupRole && nextRole && nextRole.requiredXp && newXP >= groupRole.requiredXp) {
            try {
              const updateRank = await handler.changeUserRank({ groupId, userId: user.id, roleId: nextRole.id });

              if (updateRank.status !== 200) {
                await inter.channel.send({ content: emojis.warning + " Cannot change rank:\n```diff\n- " + updateRank.statusText + "```" });
              } else {
                // announce promotion
                await inter.channel.send({ content: emojis.check + ` **@${user.name}** was promoted to **${nextRole.name}**!` });

                // reset xp after promotion
                dbUser.xp = 0;
                await dbUser.save();
              }
            } catch (err) {
              await inter.channel.send({ content: emojis.warning + ` Failed to promote **${user.name}**: ${err.message}` });
            }
          }

          processedCount++;
        } catch (err) {
          console.error('Error processing username:', uname, err);
          // best-effort notify and continue
          await inter.channel.send({ content: emojis.warning + ` Error processing \`${uname}\`:\n\`\`\`diff\n- ${err.message || err}\n\`\`\`` });
          continue;
        }
      } // end for loop

      // final edit to the original reply
      await inter.editReply({ content: emojis.check + ` Processed ${processedCount}/${usernames.length} user(s).` });
    }
    else if (cname === 'viewxp') {
      // Grab the unified "user" option (can be a mention or a Roblox username)
      const options = inter.options._hoistedOptions;
      const user_info = options.find(a => a.name === 'user');

      // Validate presence
      if (!user_info || !user_info.value) {
        return inter.reply({
          content: emojis.warning + " You must provide a user (Discord mention or Roblox username).",
          ephemeral: true
        });
      }

      const group = config.groups[0];
      const groupId = group.groupId;

      // Defer to allow time for network calls
      await inter.deferReply();

      // Helper: respond with an error message and stop
      const fail = async (msg) => {
        return inter.editReply({ content: msg });
      };

      // Helper: detect Discord mention and extract ID
      const mentionMatch = String(user_info.value).match(/^<@!?(\d+)>$/);
      let robloxUser;    // will hold Roblox user object { id, name, displayName, ... }
      let dbUserByDiscord; // if we looked up by discord

      try {
        if (mentionMatch) {
          // 1) The input is a Discord mention -> resolve the Discord user object using provided getUser()
          // You said getUser(user_info.value) already exists and returns the Discord user object
          const discordObj = await getUser(user_info.value);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Look up linked Roblox account in DB using discordId
          dbUserByDiscord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserByDiscord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1409919652494180362> command to link your account.");
          }

          // Fetch Roblox user by the stored robloxId
          robloxUser = await handler.getUser(String(dbUserByDiscord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");
        } else {
          // 2) Treat input as a Roblox username (or id) -> fetch Roblox user directly
          const maybeUsername = String(user_info.value).trim();
          robloxUser = await handler.getUser(maybeUsername);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");
        }

        // Ensure we have a robloxUser at this point
        if (!robloxUser || !robloxUser.id) {
          return fail('```diff\n- Could not resolve the Roblox user.```');
        }

        // Ensure DB record exists for the robloxId (create default xp=0 if missing)
        let dbUser = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
        if (!dbUser) {
          dbUser = await users.create({ robloxId: String(robloxUser.id), xp: 0 });
        }

        // Get user thumbnail (handler.getUserThumbnail expected to return a URL or error)
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        // Get user's role in the group
        const userRole = await handler.getUserRole(groupId, robloxUser.id);
        if (userRole.error) {
          return fail(emojis.warning + " **" + (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")** is not in the group.");
        }

        // Resolve rank info and next rank
        const groupRole = group.roles.find(r => r.id === userRole.id);
        let nextRole = group.roles.find(r => r.rank === (groupRole?.rank ?? -1) + 1);
        let notAttainable = false;
        if (!nextRole) nextRole = { name: "N/A" };
        if (!nextRole.requiredXp) notAttainable = true;

        // XP calculations
        let xpLeft = (groupRole?.requiredXp ?? 0) - (dbUser.xp ?? 0);
        if (xpLeft <= 0) xpLeft = 0;

        let progress = !notAttainable ? getPercentageBar(dbUser.xp ?? 0, groupRole.requiredXp ?? 1) : null;
        let nextRankProgress = notAttainable
          ? emojis.warning + " Not attainable through XP."
          : nextRole.name + "\n" + progress.bar + " " + progress.percentage + "%\n-#  " + (dbUser.xp ?? 0) + "/" + (groupRole.requiredXp ?? 0) + " XP";

        // Build embed
        const embed = new MessageEmbed()
          .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
          .setThumbnail(thumbnail)
          .setColor(colors.green)
          .setFooter({ text: "User ID: " + robloxUser.id })
          .addFields(
            { name: "Discord", value: dbUser.discordId ? "<@" + dbUser.discordId + ">" : "Not Verified" },
            { name: "Current Rank", value: userRole.name ?? "Unknown" },
            { name: "Next Rank", value: nextRankProgress },
          );

        // Send response
        await inter.editReply({ embeds: [embed] });

      } catch (err) {
        console.error('viewxp handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }
    else if (cname === 'update') {
      // unified "user" option (optional)
      const options = inter.options._hoistedOptions;
      const user_info = options.find(a => a.name === 'user');

      // if user_info missing, default to the command invoker
      const rawInput = user_info && user_info.value ? String(user_info.value).trim() : `<@${inter.user.id}>`;

      const group = config.groups[0];
      const groupId = group.groupId;
      const guild = await getGuild("1287311377274372198"); // you used this earlier

      await inter.deferReply();

      const fail = async (msg) => inter.editReply({ content: msg });

      try {
        // Detect Discord mention like <@123...> or raw numeric discord id
        const mentionMatch = rawInput.match(/^<@!?(\d+)>$/);
        const rawDiscordIdMatch = !mentionMatch && rawInput.match(/^(\d{17,20})$/);

        let robloxUser;
        let dbUserRecord;
        let discordIdToPass = null;

        if (mentionMatch || rawDiscordIdMatch) {
          // Resolve Discord user object using your existing getUser (you said it exists)
          const discordIdentifier = mentionMatch ? mentionMatch[0] : rawDiscordIdMatch[1];
          const discordObj = await getUser(discordIdentifier);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Find linked robloxId in DB
          dbUserRecord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserRecord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1409919652494180362> command to link your account.");
          }

          // Fetch Roblox user by stored robloxId
          robloxUser = await handler.getUser(String(dbUserRecord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          discordIdToPass = String(discordObj.id);
        } else {
          // Treat as a Roblox username or ID
          robloxUser = await handler.getUser(rawInput);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Ensure DB doc exists
          dbUserRecord = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUserRecord) {
            dbUserRecord = await users.create({ robloxId: String(robloxUser.id), xp: 0 });
          }

          // prefer to pass discordId to the updater if DB has it
          if (dbUserRecord.discordId) discordIdToPass = String(dbUserRecord.discordId);
        }

        // sanity
        if (!robloxUser || !robloxUser.id) {
          return fail('```diff\n- Could not resolve the Roblox user.```');
        }

        // Call the shared update function
        const result = await updateUserRolesToCurrent(String(robloxUser.id), guild, { discordId: discordIdToPass });

        // Build embed from result
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        const added = (result.added && result.added.length > 0) ? result.added.map(r => `<@&${r}>`).join("\n") : "None";
        const removed = (result.removed && result.removed.length > 0) ? result.removed.map(r => `<@&${r}>`).join("\n") : "None";

        const nicknameDisplay = result.nickname ? result.nickname : (dbUserRecord && dbUserRecord.discordId ? `<@${dbUserRecord.discordId}>` : (robloxUser.displayName ?? robloxUser.name ?? "N/A"));

        // Build embed
        const embed = new MessageEmbed()
          .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
          .setThumbnail(thumbnail)
          .setColor(colors.green)
          .setFooter({ text: "Roblox ID: " + robloxUser.id })
          .addFields(
            { name: "Nickname", value: nicknameDisplay },
            { name: "Added Roles", value: added },
            { name: "Removed Roles", value: removed }
          );

        // If there were any errors, append them in a field
        if (result.errors && result.errors.length > 0) {
          embed.addField("Notes", result.errors.join("\n"));
        }

        await inter.editReply({ embeds: [embed] });

      } catch (err) {
        console.error('handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }

    else if (cname === 'update2') {
      // unified "user" option (optional)
      const options = inter.options._hoistedOptions;
      const user_info = options.find(a => a.name === 'user');

      // if user_info missing, default to the command invoker
      const rawInput = user_info && user_info.value ? String(user_info.value).trim() : `<@${inter.user.id}>`;

      const group = config.groups[0];
      const groupId = group.groupId;
      const guild = await getGuild("1287311377274372198")
      await inter.deferReply();

      const fail = async (msg) => inter.editReply({ content: msg });

      try {
        // Detect Discord mention like <@123...> or raw numeric discord id
        const mentionMatch = rawInput.match(/^<@!?(\d+)>$/);
        const rawDiscordIdMatch = !mentionMatch && rawInput.match(/^(\d{17,20})$/);

        let robloxUser;       // { id, name, displayName, ... }
        let dbUserRecord;     // DB user document (PN_Users1)
        let member = null;    // GuildMember (if we can resolve)

        if (mentionMatch || rawDiscordIdMatch) {
          // Resolve Discord user object using your existing getUser (you said it exists)
          const discordIdentifier = mentionMatch ? mentionMatch[0] : rawDiscordIdMatch[1];
          const discordObj = await getUser(discordIdentifier);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Find linked robloxId in DB
          dbUserRecord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserRecord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1409919652494180362> command to link your account.");
          }

          // Fetch Roblox user by stored robloxId
          robloxUser = await handler.getUser(String(dbUserRecord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Resolve guild member from stored discordId (if possible)
          try {
            member = await getMember(dbUserRecord.discordId, guild);
          } catch (e) {
            console.warn('getMember failed:', e);
          }
        } else {
          // Treat as a Roblox username or ID
          robloxUser = await handler.getUser(rawInput);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Ensure DB doc exists for this RobloxId
          dbUserRecord = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUserRecord) {
            dbUserRecord = await users.create({ robloxId: String(robloxUser.id), xp: 0 });
          }

          // Try to resolve guild member if discordId exists in DB
          if (dbUserRecord.discordId) {
            try {
              member = await getMember(dbUserRecord.discordId, guild);
            } catch (e) {
              console.warn('getMember failed:', e);
            }
          }
        }

        // Ensure robloxUser exists now
        if (!robloxUser || !robloxUser.id) {
          return fail('```diff\n- Could not resolve the Roblox user.```');
        }

        // Get user's role in the group (Roblox)
        const userRole = await handler.getUserRole(groupId, robloxUser.id);
        if (userRole.error) {
          return fail(emojis.warning + " **" + (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")** is not in the group.");
        }

        // Find the configured group role matching the user's Roblox role ID
        const groupRole = group.roles.find(r => String(r.id) === String(userRole.id));
        if (!groupRole) {
          return fail(emojis.warning + " No matching group role configuration found for this user's Roblox role.");
        }

        // Compute unique lists (strings)
        const desiredRoles = Array.isArray(groupRole.roles) ? groupRole.roles.map(String) : [];

        // Build a unique set of all configured role IDs across all group.roles
        const allConfiguredRoleIdsSet = new Set(
          group.roles.flatMap(gr => Array.isArray(gr.roles) ? gr.roles.map(String) : [])
        );
        const allConfiguredRoleIds = Array.from(allConfiguredRoleIdsSet);

        // Roles we WOULD remove: configured roles that are NOT part of the current group's desiredRoles
        const rolesToConsiderForRemoval = allConfiguredRoleIds.filter(rid => !desiredRoles.includes(rid));

        // Prepare display defaults
        let addedRolesDisplay = "None";
        let removedRolesDisplay = "None";
        let nicknameValue = "N/A";

        // Helper to filter out role IDs that don't exist in the guild (avoid errors)
        const filterExistingRoleIds = (rids) => {
          if (!guild || !guild.roles || !guild.roles.cache) return rids;
          return rids.filter(rid => guild.roles.cache.has(rid));
        };

        if (member) {
          // Ensure member.roles.cache is available
          const memberRoles = member.roles && member.roles.cache ? member.roles.cache : new Map();

          // Filter configured roles to ones that actually exist on the guild
          const validRolesToConsiderForRemoval = filterExistingRoleIds(rolesToConsiderForRemoval);
          const validDesiredRoles = filterExistingRoleIds(desiredRoles);

          // Roles the member actually has that we should remove (unique)
          const rolesToActuallyRemove = validRolesToConsiderForRemoval.filter(rid => memberRoles.has(rid));

          // Roles the member does not have yet but should be given
          const rolesToActuallyAdd = validDesiredRoles.filter(rid => !memberRoles.has(rid));

          // Remove roles the member actually has (if any)
          if (rolesToActuallyRemove.length > 0) {
            try {
              await removeRole(member, rolesToActuallyRemove);
              removedRolesDisplay = rolesToActuallyRemove.map(r => `<@&${r}>`).join("\n");
            } catch (remErr) {
              console.warn("removeRole failed:", remErr);
              removedRolesDisplay = rolesToActuallyRemove.map(r => `<@&${r}>`).join("\n");
            }
          }

          // Add roles the member doesn't have yet (if any)
          if (rolesToActuallyAdd.length > 0) {
            try {
              await addRole(member, rolesToActuallyAdd, guild);
              addedRolesDisplay = rolesToActuallyAdd.map(r => `<@&${r}>`).join("\n");
            } catch (addErr) {
              console.warn("addRole failed:", addErr);
              addedRolesDisplay = rolesToActuallyAdd.map(r => `<@&${r}>`).join("\n");
            }
          }

          // If nothing added, explicitly show "None"
          if (rolesToActuallyAdd.length === 0) addedRolesDisplay = "None";
          if (rolesToActuallyRemove.length === 0) removedRolesDisplay = "None";

          // Try to set nickname to prefix + " " + robloxUser.name (if prefix exists)
          try {
            const prefix = (groupRole.prefix || "").toString().trim();
            const newNick = prefix.length > 0 ? `${prefix} ${robloxUser.name}` : `${robloxUser.name}`;
            // Only attempt if different from current displayName to avoid unnecessary API call
            if (member.displayName !== newNick) {
              await member.setNickname(newNick);
            }
          } catch (nickErr) {
            console.warn("Failed to set nickname:", nickErr);
            // continue even if nickname fails
          }

          // Final nicknameValue from member (after attempt)
          nicknameValue = member.displayName || (robloxUser.displayName ?? robloxUser.name ?? "N/A");
        } else {
          // member not found in guild — show planned changes but don't perform them
          const validDesiredRoles = filterExistingRoleIds(desiredRoles);
          const validRolesToConsiderForRemoval = filterExistingRoleIds(rolesToConsiderForRemoval);

          addedRolesDisplay = validDesiredRoles.length > 0 ? validDesiredRoles.map(r => `<@&${r}>`).join("\n") : "None";
          removedRolesDisplay = validRolesToConsiderForRemoval.length > 0 ? validRolesToConsiderForRemoval.map(r => `<@&${r}>`).join("\n") : "None";
          nicknameValue = robloxUser.displayName ?? robloxUser.name ?? "N/A";
        }

        // Build embed
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        const embed = new MessageEmbed()
          .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
          .setThumbnail(thumbnail)
          .setColor(colors.green)
          .setFooter({ text: "User ID: " + robloxUser.id })
          .addFields(
            //{ name: "Discord", value: nicknameValue },
            { name: "Nickname", value: "<@" + dbUserRecord.discordId + ">" },
            { name: "Added Roles", value: addedRolesDisplay },
            { name: "Removed Roles", value: removedRolesDisplay }
          );

        // Send response
        await inter.editReply({ embeds: [embed] });

      } catch (err) {
        console.error('handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }
    else if (cname === 'connect') {
      try {
        const discordId = inter.user.id;

        await inter.deferReply({ ephemeral: true })
        // Prevent creating another code if there is a pending one for this user
        const existingCode = codeByDiscord.get(discordId);
        if (existingCode) {
          const entry = codesByCode.get(existingCode);
          if (entry && entry.expiresAt > Date.now()) {
            // Still valid
            await inter.editReply({
              content: `You already have an active verification code. Please join the Roblox game and enter that code. If you didn't receive it, check your DMs. (Code expires <t:${Math.floor(entry.expiresAt / 1000)}:R>)`,
              ephemeral: true,
            });
            return;
          } else {
            // stale, remove
            codesByCode.delete(existingCode);
            codeByDiscord.delete(discordId);
          }
        }

        // Create a new code
        const code = generate6DigitCode();
        const expiresAt = Date.now() + CODE_TTL_MS;

        // Store
        codesByCode.set(code, { discordId, expiresAt });
        codeByDiscord.set(discordId, code);

        // Send ephemeral reply so command doesn't spam channel
        await inter.editReply({
          content: `Join the Roblox game using the account you wish to connect and enter the code.\n\n**Roblox game:** https://www.roblox.com/games/105425704891053/Account-Verification\n**Enter this code:**\n# ${code}\n\nThe code will expire <t:${Math.floor(expiresAt / 1000)}:R>.`,
          ephemeral: true,
        });

        // (Optional) Log
        console.log(`Generated verification code ${code} for Discord ID ${discordId}, expires ${new Date(expiresAt).toISOString()}`);
      } catch (err) {
        console.error("handleConnect error:", err);
        if (interaction && !inter.replied) {
          try { await inter.reply({ content: "Something went wrong when generating the code.", ephemeral: true }); } catch { }
        }
      }
    }
    else if (cname === 'disconnect') {
      try {
        const discordId = inter.user.id;

        // Find the DB entry linked to this Discord ID
        const doc = await users.findOne({ discordId }).exec();
        if (!doc) {
          await inter.reply({ content: "You don't have a linked Roblox account.", ephemeral: true });
          return;
        }

        // Unlink by removing discordId from the document (keep robloxId and xp)
        doc.discordId = undefined;
        await doc.save();

        await inter.reply({ content: `Your Discord has been unlinked from Roblox ID **${doc.robloxId}**.`, ephemeral: true });
      } catch (err) {
        console.error("handleDisconnect error:", err);
        try { await inter.reply({ content: "Failed to unlink your account.", ephemeral: true }); } catch { }
      }
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
  console.log(error);
});

app.post('/verify', async (req, res) => {
  if (stopFlow) return;
  try {
    if (VERIFY_SECRET) {
      const headerSecret = req.get('X-VERIFY-SECRET') || req.get('x-verify-secret');
      if (!headerSecret || headerSecret !== VERIFY_SECRET) {
        return res.status(401).json({ ok: false, error: 'invalid-secret' });
      }
    }

    const { robloxId, code, robloxUsername } = req.body ?? {};
    if (!robloxId || !code) {
      return res.status(400).json({ ok: false, error: "missing-robloxId-or-code" });
    }

    const entry = codesByCode.get(String(code));
    if (!entry) {
      return res.status(400).json({ ok: false, error: 'invalid-or-expired-code' });
    }

    // Check expiry
    if (entry.expiresAt <= Date.now()) {
      // cleanup
      codesByCode.delete(String(code));
      codeByDiscord.delete(entry.discordId);
      return res.status(400).json({ ok: false, error: 'invalid-or-expired-code' });
    }

    const discordId = entry.discordId;
    let robloxDoc = await users.findOne({ robloxId }).exec();

    // 2) If another doc has this discordId but different robloxId, unset it
    const conflictingDoc = await users.findOne({ discordId }).exec();
    if (conflictingDoc && (!robloxDoc || conflictingDoc.robloxId !== robloxDoc.robloxId)) {
      // remove discordId from conflicting doc (unlink previous mapping)
      conflictingDoc.discordId = undefined;
      await conflictingDoc.save();
    }

    if (robloxDoc) {
      robloxDoc.discordId = discordId;
      await robloxDoc.save();
    } else {
      robloxDoc = new users({
        robloxId,
        discordId,
        xp: 0,
      });
      await robloxDoc.save();
    }

    codesByCode.delete(String(code));
    codeByDiscord.delete(discordId);

    (async () => {
      try {
        const guildData = await getGuild("1287311377274372198")
        const user = await client.users.fetch(discordId);
        const robloxUser = await handler.getUser(robloxUsername);
        const group = config.groups[0]

        const member = await getMember(user.id, guildData)
        if (member) {
          let userRole = await handler.getUserRole(group.groupId, robloxUser.id);
          if (!userRole.error) {
            let groupRole = group.roles.find(r => r.id === userRole.id);
            member.setNickname(groupRole.prefix + " " + robloxUser.name)
            
            const result = await updateUserRolesToCurrent(String(robloxUser.id), guildData, { discordId: user.id });
            // Build embed from result
            const thumbnail = await handler.getUserThumbnail(robloxUser.id);

            const nicknameDisplay = result.nickname ? result.nickname : (robloxDoc && robloxDoc.discordId ? `<@${robloxDoc.discordId}>` : (robloxUser.displayName ?? robloxUser.name ?? "N/A"));

            // Build embed
            const embed = new MessageEmbed()
              .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
              .setThumbnail(thumbnail)
              .setColor(colors.green)
              .setFooter({ text: "Roblox ID: " + robloxUser.id })
              .addFields(
                { name: "Nickname", value: nicknameDisplay },
                { name: "Added Roles", value: result.added.length },
                { name: "Removed Roles", value: result.removed.length }
              );

            // If there were any errors, append them in a field
            if (result.errors && result.errors.length > 0) {
              embed.addField("Notes", result.errors.join("\n"));
            }

            let logs = await getChannel("1410166975837114378")
            logs.send({ embeds: [embed] }).catch(err => console.log(err));
          }
        }

        let embed = new MessageEmbed()
          .setTitle(robloxUser.displayName + ' (@' + robloxUser.name + ')')
          .setDescription(emojis.on + " Your discord has been linked to this roblox account.")
          .setFooter({ text: "User ID: " + robloxUser.id })
          .setColor(colors.green)

        await user.send({ embeds: [embed] });
      } catch (dmErr) {
        console.warn(`Failed to DM verification success to ${discordId}:`, dmErr?.message || dmErr);
      }
    })();

    // Respond to the Roblox game that verify succeeded
    return res.json({
      ok: true,
      robloxId,
      discordId,
      message: 'linked',
    });

  } catch (err) {
    console.error("POST /verify error:", err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

app.get('/_verify_status/:discordId', (req, res) => {
  if (stopFlow) return;
  const discordId = req.params.discordId;
  const code = codeByDiscord.get(discordId);
  if (!code) return res.json({ ok: true, active: false });
  const entry = codesByCode.get(code);
  if (!entry) return res.json({ ok: true, active: false });
  return res.json({ ok: true, active: true, code, expiresAt: entry.expiresAt });
});

// health check
app.get('/', (req, res) => res.json({ ok: true }));

async function updateUserRolesToCurrent(robloxId, guild, opts = {}) {
  const summary = {
    ok: false,
    memberFound: false,
    robloxUser: null,
    groupRole: null,
    added: [],
    removed: [],
    skippedAdd: [],
    skippedRemove: [],
    nickname: null,
    errors: [],
  };

  try {
    // Basic inputs
    const group = config.groups[0];
    const groupId = group.groupId;

    // Resolve roblox user details (handler.getUser handles id or username)
    let robloxUser;
    try {
      robloxUser = await handler.getUser(String(robloxId));
      if (robloxUser && robloxUser.error) {
        summary.errors.push(`Roblox lookup failed: ${robloxUser.error}`);
        return summary;
      }
    } catch (e) {
      summary.errors.push(`Roblox lookup error: ${e.message || e}`);
      return summary;
    }
    summary.robloxUser = robloxUser;

    // Get user's role in Roblox group
    let userRole;
    try {
      userRole = await handler.getUserRole(groupId, robloxUser.id);
      if (userRole && userRole.error) {
        summary.errors.push(`User is not in the group.`);
        return summary;
      }
    } catch (e) {
      summary.errors.push(`getUserRole error: ${e.message || e}`);
      return summary;
    }

    // Find the matching configured groupRole
    const groupRole = group.roles.find(r => String(r.id) === String(userRole.id));
    if (!groupRole) {
      summary.errors.push(`No configured group role for Roblox role ID ${userRole.id}`);
      return summary;
    }
    summary.groupRole = groupRole;

    // Build desiredRoles and set of all configured role IDs (deduped)
    const desiredRoles = Array.isArray(groupRole.roles) ? groupRole.roles.map(String) : [];
    const allConfiguredRoleIdsSet = new Set(
      group.roles.flatMap(gr => Array.isArray(gr.roles) ? gr.roles.map(String) : [])
    );
    const allConfiguredRoleIds = Array.from(allConfiguredRoleIdsSet);

    // Roles that would be removed: configured roles not in desiredRoles
    const rolesToConsiderForRemoval = allConfiguredRoleIds.filter(rid => !desiredRoles.includes(rid));

    // Resolve member: prefer opts.discordId, otherwise check DB for linked discordId
    let member = null;
    let discordId = opts.discordId;
    try {
      if (!discordId) {
        const dbRec = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
        if (dbRec && dbRec.discordId) discordId = dbRec.discordId;
      }
      if (discordId) {
        member = await getMember(String(discordId), guild).catch(e => { throw e; });
      }
    } catch (e) {
      // getMember failure -> treat as member not found but continue to return planned lists
      // log but do not fatal
      summary.errors.push(`getMember failed: ${e.message || e}`);
      member = null;
    }

    // For guild role existence checks
    const filterExistingRoleIds = (rids) => {
      if (!guild || !guild.roles || !guild.roles.cache) return rids;
      return rids.filter(rid => guild.roles.cache.has(rid));
    };

    // Filter IDs to ones that actually exist on the guild
    const validDesiredRoles = filterExistingRoleIds(desiredRoles);
    const validRolesToConsiderForRemoval = filterExistingRoleIds(rolesToConsiderForRemoval);

    // If no member found -> return planned lists and stop (memberFound = false)
    if (!member) {
      summary.memberFound = false;
      summary.added = []; // nothing executed
      summary.removed = [];
      summary.skippedAdd = validDesiredRoles.slice(); // show planned
      summary.skippedRemove = validRolesToConsiderForRemoval.slice();
      summary.nickname = null;
      summary.ok = true;
      return summary;
    }

    // Member present -> compute current roles
    summary.memberFound = true;
    const memberRoles = member.roles && member.roles.cache ? member.roles.cache : new Map();

    // Roles to actually remove: intersection of validRolesToConsiderForRemoval & member's roles
    const rolesToActuallyRemove = validRolesToConsiderForRemoval.filter(rid => memberRoles.has(rid));
    // Roles to actually add: validDesiredRoles minus member's roles
    const rolesToActuallyAdd = validDesiredRoles.filter(rid => !memberRoles.has(rid));

    // Remove roles (only ones member actually has)
    if (rolesToActuallyRemove.length > 0) {
      try {
        // removeRole is expected to exist (you said it does)
        await removeRole(member, rolesToActuallyRemove);
        summary.removed = rolesToActuallyRemove.slice();
      } catch (e) {
        summary.errors.push(`removeRole error: ${e.message || e}`);
        // mark which we attempted as removed for transparency
        summary.removed = rolesToActuallyRemove.slice();
      }
    } else {
      summary.removed = [];
    }

    // Add roles (only ones member doesn't have yet)
    if (rolesToActuallyAdd.length > 0) {
      try {
        // support both addRoles or addRole helper names just in case
        if (typeof addRoles === 'function') {
          await addRoles(member, rolesToActuallyAdd, guild);
        } else if (typeof addRole === 'function') {
          await addRole(member, rolesToActuallyAdd, guild);
        } else {
          throw new Error('No addRoles/addRole helper available');
        }
        summary.added = rolesToActuallyAdd.slice();
      } catch (e) {
        summary.errors.push(`addRole(s) error: ${e.message || e}`);
        summary.added = rolesToActuallyAdd.slice();
      }
    } else {
      summary.added = [];
    }

    // Fill skipped lists (roles that were valid but weren't added/removed because conditions)
    summary.skippedAdd = validDesiredRoles.filter(rid => !summary.added.includes(rid));
    summary.skippedRemove = validRolesToConsiderForRemoval.filter(rid => !summary.removed.includes(rid));

    // Attempt to set nickname to prefix + " " + robloxUser.name
    try {
      const prefix = (groupRole.prefix || "").toString().trim();
      const newNick = prefix.length > 0 ? `${prefix} ${robloxUser.name}` : `${robloxUser.name}`;
      if (member.displayName !== newNick) {
        await member.setNickname(newNick);
        summary.nickname = newNick;
      } else {
        summary.nickname = member.displayName;
      }
    } catch (e) {
      summary.errors.push(`setNickname failed: ${e.message || e}`);
      // set nickname to current displayName if available
      summary.nickname = member.displayName || null;
    }

    summary.ok = true;
    return summary;
  } catch (err) {
    summary.errors.push(`Unexpected error: ${err.message || err}`);
    return summary;
  }
}