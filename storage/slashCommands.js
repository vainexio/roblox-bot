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
      name: 'setrank',
      type: 1,
      description: 'Set rank command',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'rank', type: 3, description: 'Rank', required: true },
      ]
    },
  ],
};
