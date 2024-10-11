 let colors = {
  red: "#ea3737",
  blue: "#1200ff",
  green: "#00ff04",
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
  prefix: ";", //Prefix
  shop: {
    breakChecker: false,
    checkers: [],
    autoQueue: false,
    refCode: false,
    viaContent: true,
    channels: {
      checker: '',
      boostStocks: '',
      basicStocks: '',
      otherStocks: '',
      templates: '',
      drops: '',
      orders: '',
      reports: '',
      output: '',
    },
    dmMessage: '',
    qMessage: '',
    rMessage: '',
    ar: {
      responders: [
        {
          trigger: '.39847324',
          content: '1152546156300218431',
          autoDelete: true,
          row: null,
        },
      ],
    },
    promptMessage: null,
    bot: {
      status: {
        status: "dnd",
        activities: [
          {
            name: "BA",
            type: "Watching".toUpperCase(),
            //url: 'https://www.twitch.tv/videos/1841805330'
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
      id: "1261689703808106508",
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
