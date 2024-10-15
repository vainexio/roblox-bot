/*
SUB_COMMAND - 1
SUB_COMMAND_GROUP - 2
STRING - 3
INTEGER - 4
BOOLEAN - 5
USER - 6
CHANNEL - 7
ROLE - 8
MENTIONABLE - 9
NUMBER - 10
ATTACHMENT - 11
*/

let groups = [ 
  { name: 'RMP', value: '34634981' }, 
  { name: 'BOP', value: '34844808' }, 
  { name: 'UKSF', value: '8582078' },
  { name: 'RGG', value: '8584027' },
  { name: 'RGR', value: '34635006' },
  { name: 'ETS', value: '34628760' },
]

module.exports = {
  register: true,
  deleteSlashes: [],
  slashes: [
    {
      name: 'setrank',
      type: 1,
      description: 'Set rank command',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'rank', type: 3, description: 'Rank', required: true },
        { name: 'group', type: 3, description: 'Group name', choices: groups, required: true },
      ]
    },
    {
      name: 'accept',
      type: 1,
      description: 'Accept user to a group',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'group', type: 3, description: 'Group name', choices: groups, required: true },
      ]
    },
    {
      name: 'kick',
      type: 1,
      description: 'Accept user to a group',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'group', type: 3, description: 'Group name', choices: groups, required: true },
      ]
    },
  ],
};
