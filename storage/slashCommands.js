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
  register: false,
  deleteSlashes: [],
  slashes: [
    {
      "name": "selection",
      "type": 1,
      "description": "Host a selection",
      "options": [
        {
          "name": "division",
          "type": 3,
          "description": "Choose whether to add or subtract XP",
          "required": true,
          "choices": [
            { "name": "DFA", "value": "Department of Foreign Affairs" },
            { "name": "NAW", "value": "Naval Air Wing" },
            { "name": "NAVSOC", "value": "Naval Special Operations Command" },
            { "name": "NCEB", "value": "Naval Combat Engineer Brigade" },
            { "name": "NETDC", "value": "Naval Education & Training Doctrine Command" },
            { "name": "NOCC", "value": "Naval Officer Candidate Course" },
            { "name": "NSF", "value": "Naval Security Force" },
            { "name": "OCF", "value": "Ⲟffshore Combat Force" },
            { "name": "QS", "value": "Quartermaster Servіce" },
          ]
        },
        {
          "name": "host",
          "type": 6,
          "description": "Selection host",
          "required": true
        },
        {
          "name": "note",
          "type": 3,
          "description": "Selection note",
          "required": true
        },
        {
          "name": "link",
          "type": 3,
          "description": "Game link",
          "required": true
        },
        {
          "name": "promotion_image",
          "type": 11,
          "description": "The promotion image wil be put on the announcement's thumbnail",
          "required": true
        },
        {
          "name": "co_host",
          "type": 6,
          "description": "Selection co-host",
          "required": false
        },
      ],
    },
    {
      "name": "training",
      "type": 1,
      "description": "Host a training",
      "options": [
        {
          "name": "type",
          "type": 3,
          "description": "Type of training",
          "required": true,
          "choices": [
            { "name": "Physical Training / Calisthenics", "value": "Physical Training / Calisthenics" },
            { "name": "Combat Training", "value": "Combat Training" },
            { "name": "Ceremonial & Close Order Drills", "value": "Ceremonial & Close Order Drills" },
          ]
        },
        {
          "name": "host",
          "type": 6,
          "description": "Selection host",
          "required": true
        },
        {
          "name": "note",
          "type": 3,
          "description": "Selection note",
          "required": true
        },
        {
          "name": "link",
          "type": 3,
          "description": "Game link",
          "required": true
        },
        {
          "name": "co_host",
          "type": 6,
          "description": "Selection co-host",
          "required": false
        },
      ],
    },
    {
      "name": "connect",
      "type": 1,
      "description": "Connect your roblox account",
      "options": []
    },
    {
      "name": "disconnect",
      "type": 1,
      "description": "Disconnect your roblox account",
      "options": []
    },
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
          "name": "usernames",
          "type": 3,
          "description": "Discord or Roblox usernames. Separate each name by comma (player1, player2, @User1, @User2)",
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
      "name": "update",
      "type": 1,
      "description": "Update user roles",
      "options": [
        {
          "name": "user",
          "type": 3,
          "description": "Discord or Roblox username",
          "required": false
        },
      ]
    },
    {
      "name": "viewxp",
      "type": 1,
      "description": "View user XP",
      "options": [
        {
          "name": "user",
          "type": 3,
          "description": "Discord or Roblox username",
          "required": true
        },
      ]
    },
    {
      name: 'setrank',
      type: 1,
      description: 'Update user rank',
      options: [
        { name: 'user', type: 3, description: 'Discord or Roblox username', required: true },
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