 let colors = {
  red: "#FF7373",
  blue: "#85A3FF",
  green: "#73FF8F",
  yellow: "#fff4a1",
  orange: "#ff6300",
  purple: "#b200ff",
  pink: "#ff00d6",
  cyan: "#00feff",
  black: "#000000",
  white: "#ffffff",
  lime: "#7ebb82",
  none: "#2B2D31",
}

module.exports = {
  prefix: ";", // Prefix
  config: {
    groups: [
      {
        "groupId": 35042233,
        "roles": [
          {
            "id": 190644070,
            "name": "Basic Sailor Course",
            "rank": 1,
            "requiredXp": 100,
          },
          {
            "id": 190704122,
            "name": "[E1] Apprentice Seaman",
            "rank": 2,
            "requiredXp": 100,
          },
          {
            "id": 191296077,
            "name": "[E2] Seaman Second Class",
            "rank": 3,
            "requiredXp": 100,
          },
          {
            "id": 190754080,
            "name": "[E3] Seaman First Class",
            "rank": 4,
            "requiredXp": 100,
          },
          {
            "id": 191380127,
            "name": "[E4] Petty Officer Third Class",
            "rank": 5,
            "requiredXp": 100,
          },
          {
            "id": 190356134,
            "name": "[E5] Petty Officer Second Class",
            "rank": 6,
            "requiredXp": 100,
          },
          {
            "id": 191136109,
            "name": "[E6] Petty Officer First Class",
            "rank": 7,
            "requiredXp": 100,
          },
        ]
      }
    ],
    channels: {
      output: '',
    },
    bot: {
      status: {
        status: "dnd",
        activities: [
          {
            name: "The Philippine Navy",
            type: "Watching".toUpperCase(),
          },
        ],
      },
    },
  },
  permissions: [
    {
      id: "",
      level: 4,
    },
    {
      id: "",
      level: 4,
    },
    {
      id: "",
      level: 5,
    },
    {
      id: "497918770187075595",
      level: 5,
    },
  ],
  colors: colors,
  theme: colors.none,
  emojis: {
    check: '<a:CHECK:1138778694983356450>',
    x: '<a:Xmark:1138778760628424735>',
    loading: '<a:Loading:1138778730785943614>',
    warning: '⚠️',
    nboost: '<:boost:1248993578181726269>',
    nclasic: '<a:classic:1248921754097815572>',
    nbasic: '<:basic:1248921754097815572>'
  },
  commands: [
    //
    {
      Command: "help",
      Template: " [command]",
      Alias: [],
      Category: "Misc",
      Desc: "Description",
      ex: [],
      level: 4,
    },
    //
  ],
};
