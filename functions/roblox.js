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

async function refreshToken(cookie) {
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
}

module.exports = {
  handler: {
    changeUserRank: async function (data) {
        const auth = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "x-csrf-token": csrfToken,
            "Cookie": `${process.env.Cookie}`,
          },
          body: JSON.stringify({ roleId: data.roleId }),
        };
        let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
        if (patchRes.status === 403) {
          csrfToken = await refreshToken(process.env.Cookie);
          auth.headers["x-csrf-token"] = csrfToken;
          patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
          return patchRes;
        }
        return patchRes;
      },
    getUserThumbnail: async function (userId) {
      let thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false&thumbnailType=HeadShot`);
      let thumbnail = await thumbnailResponse.json();
      thumbnail = !thumbnail.errors ? thumbnail.data[0].imageUrl : '';
      return thumbnail;
    },
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
    acceptUser: async function (groupId,userId) {
      const auth = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let link = `https://groups.roblox.com/v1/groups/${groupId}/join-requests/users/${userId}`
      console.log(link)
      let patchRes = await fetch(link, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(link, auth);
        return patchRes;
      }
      return patchRes;
    },
    kickUser: async function (groupId,userId) {
      const auth = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
        return patchRes;
      }
      return patchRes;
    },
    //
    cToken: function() { return csrfToken },
    getGroupRoles: async function (groupId) {
      try {
        let groupRolesResponse = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        let groupRoles = await groupRolesResponse.json();
        return groupRoles;
      } catch (err) {
        return { error: err }
      }
    },
    refreshToken,
    //
    
  }
};