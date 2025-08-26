function hasRole (member, roles) {
  for (let i in roles) {
    let foundRole = false
    member.roles.cache.some(role => role.name.toLowerCase() === roles[i].toLowerCase() || role.id === roles[i] ? foundRole = role : false)
    if (foundRole) {
      return foundRole;
    }
  }
}
module.exports = {
  getRole: async function (role, guild) {
    let foundRole = await guild.roles.cache.find(foundRole => foundRole.name.toLowerCase() === role.toLowerCase || foundRole.id === role);
    if (foundRole) {
      return foundRole;
    }
},
  addRole: async function (member, roles, guild) {
    let notAdded = []
  for (let i in roles) {
    let role = await guild.roles.cache.find(role => role.name.toLowerCase() === roles[i].toLowerCase() || role.id === roles[i]);
      role ? await member.roles.add(role).catch(e => notAdded.push(roles[i])) : notAdded.push(roles[i])
  }
    if (notAdded.length > 0) {
      return notAdded;
    }
},
  removeRole: async function (member, roles) {
    let notRemoved = []
  for (let i in roles) {
    let roletoRemove = false
    await member.roles.cache.some(role => role.name.toLowerCase() === roles[i].toLowerCase() || role.id === roles[i] ? roletoRemove = role.id : false)
      roletoRemove ? member.roles.remove(roletoRemove).catch(e => notRemoved.push(roles[i])) : notRemoved.push(roles[i])
  }
    if (notRemoved.length > 0) {
      return notRemoved;
    }
},
  hasRole: hasRole,
};