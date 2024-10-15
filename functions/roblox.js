const settings = require('../storage/settings_.js')
const {prefix, colors, theme, commands, permissions, emojis,} = settings
const others = require('../functions/others.js')
//Functions
const get = require('../functions/get.js')
const {getTime, chatAI, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor} = get
const fetch = require('node-fetch');

const {makeCode, stringJSON, fetchKey, ghostPing, moderate, getPercentage, sleep, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow} = others


const version = "Handler version: v2.0.2"
let csrfToken = "abc"

module.exports = {
  handler: {
    cToken: function() { return csrfToken },
    getUser: async function (username) {
      let userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (userResponse.status !== 200) return { error: userResponse.status+": "+userResponse.statusText }
      
      let user = (await userResponse.json()).data[0];
      if (!user) return { error: "This roblox account doesn't exist!" }
      console.log('Designated user:', user);
      
      return user;
    },
    getUserRole: async function (groupId,userId) {
      try {
        let userRolesResponse = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
        let userRoles = await userRolesResponse.json();
        let groupData = userRoles.data.find(d => d.group.id == groupId);
        let role = groupData.role;
        return role;
      } catch (err) {
        return { error: err }
      }
    },
    
    refreshToken: async function (cookie) {
      const response = await fetch('https://auth.roblox.com/v2/logout', {
        method: "POST",
        headers: {
          "Cookie": cookie
        }
      });
  
      if (response.status === 403) {
        csrfToken = response.headers.get('x-csrf-token')
        console.log("New csrfToken token: "+csrfToken)
        return csrfToken;
      } else {
        return { error: "Can't get CSRF token!" }
      }
      throw new Error('Failed to retrieve CSRF token.');
    },
    
  }
};