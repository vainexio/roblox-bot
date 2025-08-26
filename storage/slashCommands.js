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

module.exports = {
  register: true,
  deleteSlashes: [],
  slashes: [
    {
      "name": "xp",
      "type": 1,
      "description": "Add or subtract XP from a user",
      "options": [
        {
          "name": "type",
          "type": 3,
          "description": "Choose whether to add or subtract XP",
          "required": true,
          "choices": [
            { "name": "Add", "value": "Add" },
            { "name": "Subtract", "value": "Subtract" }
          ]
        },
        {
          "name": "username",
          "type": 3,
          "description": "Roblox username",
          "required": true
        },
        {
          "name": "amount",
          "type": 4,
          "description": "Amount of XP to add or subtract",
          "required": true
        }
      ]
    },
    {
      "name": "viewxp",
      "type": 1,
      "description": "View user XP",
      "options": [
        {
          "name": "username",
          "type": 3,
          "description": "Roblox username",
          "required": true
        },
      ]
    },
    {
      name: 'setrank',
      type: 1,
      description: 'Update user rank',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'rank', type: 3, description: 'Rank', required: true },
      ]
    },
    /*
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
    },*/
    
  ],
};
