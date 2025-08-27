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
            "prefix": "[BSC]",
            "rank": 1,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 190704122,
            "name": "[E1] Apprentice Seaman",
            "prefix": "[E1]",
            "rank": 2,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 191296077,
            "name": "[E2] Seaman Second Class",
            "prefix": "[E2]",
            "rank": 3,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 190754080,
            "name": "[E3] Seaman First Class",
            "prefix": "[E3]",
            "rank": 4,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 191380127,
            "name": "[E4] Petty Officer Third Class",
            "prefix": "[E4]",
            "rank": 5,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 190356134,
            "name": "[E5] Petty Officer Second Class",
            "prefix": "[E5]",
            "rank": 6,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 191136109,
            "name": "[E6] Petty Officer First Class",
            "prefix": "[E6]",
            "rank": 7,
            "requiredXp": 100,
            "roles": [""]
          },
          {
            "id": 190424109,
            "name": "[E7] Chief Petty Officer",
            "prefix": "[E7]",
            "rank": 8,
            "roles": [""]
          },
          {
            "id": 191272107,
            "name": "[E8] Senior Chief Petty Officer",
            "prefix": "[E8]",
            "rank": 9,
            "roles": [""]
          },
          {
            "id": 193674056,
            "name": "[E9] Master Chief Petty Officer",
            "prefix": "[E9]",
            "rank": 10,
            "roles": [""]
          },
          {
            "id": 190646120,
            "name": "[O1] Ensign",
            "prefix": "[O1]",
            "rank": 11,
            "roles": [""]
          },
          {
            "id": 190352121,
            "name": "[O2] Lieutenant Junior Grade",
            "prefix": "[O2]",
            "rank": 12,
            "roles": [""]
          },
          {
            "id": 190548111,
            "name": "[O3] Lieutenant",
            "prefix": "[O3]",
            "rank": 13,
            "roles": [""]
          },
          {
            "id": 191314119,
            "name": "[O4] Lieutenant Commander",
            "prefix": "[O4]",
            "rank": 14,
            "roles": [""]
          },
          {
            "id": 190734115,
            "name": "[O5] Commander",
            "prefix": "[O5]",
            "rank": 15,
            "roles": [""]
          },
          {
            "id": 190564114,
            "name": "[O6] Captain",
            "prefix": "[O6]",
            "rank": 16,
            "roles": [""]
          },
          {
            "id": 190852107,
            "name": "[O7] Commodore",
            "prefix": "[O7]",
            "rank": 17,
            "roles": [""]
          },
          {
            "id": 190358142,
            "name": "[O8] Rear Admiral",
            "prefix": "[O8]",
            "rank": 18,
            "roles": [""]
          },
          {
            "id": 494116083,
            "name": "Chief of Naval Staff",
            "prefix": "[CNS]",
            "rank": 19,
            "roles": [""]
          },
          {
            "id": 180894075,
            "name": "Command Master Chief of the Navy",
            "prefix": "[CMCPN]",
            "rank": 20,
            "roles": ["1299670414162919454","1287312708084957285"]
          },
          {
            "id": 180776078,
            "name": "Vice Commander of the Philippine Navy",
            "prefix": "[VCPN]",
            "rank": 21,
            "roles": ["1299670414162919454","1287312705937477702"]
          },
          {
            "id": 180098078,
            "name": "Flag Officer-in-Command of the Philippine Navy",
            "prefix": "[FOICPN]",
            "rank": 255,
            "roles": ["1299670414162919454","1287312705799192618"]
          }
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
      id: "1398914377716990063",
      level: 3,
    },
    {
      id: "1299670414162919454",
      level: 4,
    },
   {
    id: "798521988598464542", // SWAT
    level: 4,
   },
   {
    id: "1388771765341261874", // Feeling
    level: 4,
   },
   {
    id: "897860764591853578", //Seyv4Life
    level: 4,
   },
    {
      id: "995661736818524241", // Mitabi
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
    check: '<a:check:969936488739512340>',
    x: '<a:Xmark:969401924736651284>',
    loading: '<a:loading:968743431528669210>',
    warning: '<:S_warning:1108743925012902049>',
    on: '<:on:1107664866484953178>',
    off: ':off:1107664839372964010>',
    green: '<:online_:1004014930959286342>',
    red: '<:dnd_:1004017480613773422>',
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
