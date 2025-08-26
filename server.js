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
const CODE_TTL_MS = 1 * 60 * 1000; // 10 minutes default (change as needed)
const VERIFY_SECRET = process.env.VERIFY_SECRET || null; // optional header secret for /verify

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

  usersSchema.index({ robloxId: 1 }, { unique: true });
  usersSchema.index({ discordId: 1 }, { unique: true, sparse: true });

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
  if (message.content == "killdis") {
    process.exit(1);
  }
}); //END MESSAGE CREATE

//

client.on("interactionCreate", async (inter) => {
  if (inter.isCommand()) {
    let cname = inter.commandName

    if (cname === 'setrank') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const username = options.find(a => a.name === 'username');
      const rank = options.find(a => a.name === 'rank');
      const group = config.groups[0];
      const groupId = group.groupId;

      await inter.deferReply();

      let user = await handler.getUser(username.value)
      if (user.error) return inter.editReply({ content: '```diff\n- ' + user.error + "```" })
      let role = await handler.getUserRole(groupId, user.id)
      if (role.error) return inter.editReply({ content: '```diff\n- ' + user.error + "```" })
      // Get group roles to find the target role
      let groupRoles = await handler.getGroupRoles(groupId)
      let targetRole = groupRoles.roles.find(r => r.name.toLowerCase().includes(rank.value.toLowerCase()));

      if (!targetRole) return inter.editReply({ content: `Rank does not exist: ${rank.value}` });
      console.log('Target role:', targetRole);
      // Function to update the rank
      let updateRank = await handler.changeUserRank({ groupId: groupId, userId: user.id, roleId: targetRole.id })

      if (updateRank.status !== 200) return inter.editReply({ content: emojis.warning + " Cannot change rank:\n```diff\n- " + updateRank.statusText + "```" });

      // Get thumbnail and send response
      let thumbnail = await handler.getUserThumbnail(user.id)
      //let foundGroup = await handler.getGroup(groupId)

      let embed = new MessageEmbed()
        .setThumbnail(thumbnail)
        .setFooter({ text: "User ID: " + user.id })
        .setColor(colors.none)
        .addFields(
          { name: "User", value: user.displayName + " (@" + user.name + ")" },
          { name: "Updated Rank", value: `\`\`\`diff\n+ ${targetRole.name}\`\`\`` },
          { name: "Previous Rank", value: `\`\`\`diff\n- ${role.name}\`\`\`` }
        )

      await inter.editReply({ content: emojis.check + ' Rank Updated', embeds: [embed] });
    }
    else if (cname === 'xp') {
      if (!await getPerms(inter.member, 3)) return inter.reply({ content: '⚠️ Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const type = options.find(a => a.name === 'type');
      const username = options.find(a => a.name === 'username');
      const amount = options.find(a => a.name === 'amount');
      const group = config.groups[0];
      const groupId = group.groupId;

      // initial reply while processing
      await inter.reply({ content: "-# " + emojis.loading });

      // parse usernames (comma separated)
      const usernames = username.value
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

      const xpToChange = parseInt(amount.value);
      if (isNaN(xpToChange) || xpToChange < 0) {
        return await inter.editReply({ content: emojis.warning + " Invalid amount." });
      }
      if (xpToChange > 20 && !await getPerms(inter.member, 4)) {
        return await inter.editReply({ content: emojis.warning + " Max XP to change is 20." });
      }

      let processedCount = 0;

      for (const uname of usernames) {
        let user
        try {
          // fetch user
          user = await handler.getUser(uname);
          if (user.error) return inter.editReply({ content: '```diff\n- ' + user.error + "```" });

          // get or create DB user
          let dbUser = await users.findOne({ robloxId: user.id });
          if (!dbUser) {
            dbUser = await users.create({ robloxId: user.id, xp: 0 });
          }

          // compute new XP
          let newXP = dbUser.xp;
          if (type.value === "Add" || type.value.toLowerCase() === "add") {
            newXP = dbUser.xp + xpToChange;
          } else if (type.value === "Subtract" || type.value.toLowerCase() === "subtract") {
            newXP = dbUser.xp - xpToChange;
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
            await inter.channel.send({ content: emojis.warning + " **" + user.displayName + " (@" + user.name + ")** is not in the group." })
            continue;
          }
          const groupRole = group.roles.find(r => r.id === userRole.id) || null;
          const nextRole = groupRole ? group.roles.find(r => r.rank === groupRole.rank + 1) : null;
          if (!nextRole || !nextRole.requiredXp) {
            await inter.channel.send({ content: emojis.warning + ` **${user.name}**'s rank cannot receive XP.` })
            continue;
          }
          let progress = getPercentageBar(dbUser.xp, groupRole.requiredXp)
          let emojiState = type.value == "Add" ? emojis.green : emojis.red
          // Build embed
          const embed = new MessageEmbed()
            .setThumbnail(thumbnail)
            .setColor(type.value === "Add" ? colors.green : colors.red) // visual cue
            .setDescription(`${emojiState} ${type.value}ed **${xpToChange} XP** to ${user.displayName} (@${user.name})`)
            .setFooter({ text: "User ID: " + user.id })
            .addFields(
              { name: "Current Rank", value: userRole.name || "Unknown" },
              { name: "Next Rank", value: nextRole.name + "\n" + progress.bar + " " + progress.percentage + "%\n-#  " + dbUser.xp + "/" + groupRole.requiredXp + " XP" },
            )

          // Send the embed to channel
          await inter.channel.send({ embeds: [embed] });

          // If user qualifies for promotion
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
              await inter.channel.send({ content: emojis.warning + ` Failed to promote **${uname}**: ${err.message}` });
            }
          }

          processedCount++;
        } catch (err) {
          console.log(err)
          await inter.channel.send({ content: emojis.warning + ` Error processing **${user.name}**:\n\`\`\`diff\n- ${err.message}\n\`\`\`` });
          continue;
        }
      } // end for loop

      // final edit to the original reply
      await inter.editReply({ content: emojis.check + ` Processed ${processedCount}/${usernames.length} user(s).` });
    }
    else if (cname === 'viewxp') {

      const options = inter.options._hoistedOptions;
      const username = options.find(a => a.name === 'username');
      const group = config.groups[0]
      const groupId = group.groupId
      await inter.deferReply();

      let user = await handler.getUser(username.value);
      if (user.error) return inter.editReply({ content: '```diff\n- ' + user.error + "```" });

      // Get existing user document or create default
      let dbUser = await users.findOne({ robloxId: user.id });
      if (!dbUser) {
        dbUser = await users.create({ robloxId: user.id, xp: 0 });
      }

      // Get thumbnail and group
      let thumbnail = await handler.getUserThumbnail(user.id);

      let userRole = await handler.getUserRole(groupId, user.id);
      if (userRole.error) return inter.editReply({ content: emojis.warning + " **" + user.displayName + " (@" + user.name + ")** is not in the group." })
      let groupRole = group.roles.find(r => r.id === userRole.id);
      let nextRole = group.roles.find(r => r.rank === groupRole?.rank + 1);
      let notAttainable = false
      if (!nextRole) nextRole = { name: "N/A" }
      if (!nextRole.requiredXp) notAttainable = true
      let xpLeft = groupRole.requiredXp - dbUser.xp
      xpLeft <= 0 ? xpLeft = 0 : null

      let progress = !notAttainable ? getPercentageBar(dbUser.xp, groupRole.requiredXp) : null
      let nextRankProgress = notAttainable ?
        emojis.warning + " Not attainable through XP."
        : nextRole.name + "\n" + progress.bar + " " + progress.percentage + "%\n-#  " + dbUser.xp + "/" + groupRole.requiredXp + " XP"
      // Build embed
      let embed = new MessageEmbed()
        .setAuthor({ name: user.displayName + ' (@' + user.name + ')', iconURL: thumbnail })
        .setThumbnail(thumbnail)
        .setColor(colors.green)
        .setFooter({ text: "User ID: " + user.id })
        .addFields(
          { name: "Current Rank", value: userRole.name },
          { name: "Next Rank", value: nextRankProgress },
        )

      // Send response
      await inter.editReply({ embeds: [embed] });
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
  try {
    // Optional: shared secret check
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

    // We now link this discordId <-> robloxId in DB.
    // Handle unique constraints: other documents might already have this discordId set.
    // 1) Find existing doc for robloxId
    let robloxDoc = await users.findOne({ robloxId }).exec();

    // 2) If another doc has this discordId but different robloxId, unset it
    const conflictingDoc = await users.findOne({ discordId }).exec();
    if (conflictingDoc && (!robloxDoc || conflictingDoc.robloxId !== robloxDoc.robloxId)) {
      // remove discordId from conflicting doc (unlink previous mapping)
      conflictingDoc.discordId = undefined;
      await conflictingDoc.save();
    }

    if (robloxDoc) {
      // update discordId
      robloxDoc.discordId = discordId;
      await robloxDoc.save();
    } else {
      // create new document
      robloxDoc = new users({
        robloxId,
        discordId,
        xp: 0,
      });
      await robloxDoc.save();
    }

    // mark code used: remove from maps
    codesByCode.delete(String(code));
    codeByDiscord.delete(discordId);

    // Notify the Discord user by DM (best-effort)
    (async () => {
      try {
        const user = await client.users.fetch(discordId);
        const robloxUser = await handler.getUser(robloxUsername);
        await user.send(`${emojis.check} Your Discord account has been linked to **${robloxUser.displayName} (@${robloxUser.name})**!`);
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

// === OPTIONAL: Helper endpoint to check status (debug only) ===
// (Remove or protect in production)
app.get('/_verify_status/:discordId', (req, res) => {
  const discordId = req.params.discordId;
  const code = codeByDiscord.get(discordId);
  if (!code) return res.json({ ok: true, active: false });
  const entry = codesByCode.get(code);
  if (!entry) return res.json({ ok: true, active: false });
  return res.json({ ok: true, active: true, code, expiresAt: entry.expiresAt });
});

// health check
app.get('/', (req, res) => res.json({ ok: true }));