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

const settings = require('../storage/settings_.js')
const {shop, emojis, colors, theme, status} = settings

let accounts = [ 
  { name: 'dos_acc', value: 'dos_acc' }, 
  { name: 'tres_acc', value: 'tres_acc' }, 
]
let types = [
  { name: 'nitro boost', value: 'nitro' },
  { name: 'nitro boost yearly', value: 'nitro-yearly' },
  { name: 'nitro basic', value: 'nitro-basic' },
]


module.exports = {
  register: true,
  deleteSlashes: ['1174898700338864138'],
  slashes: [
    {
      name: 'codes',
      type: 1,
      description: 'Get claimable links',
      options: [
        { name: 'account', type: 3, description: 'Account name', choices: accounts, required: true },
        { name: 'type', type: 3, description: 'Type of link', choices: types, required: false },
        { name: 'exclude', type: 4, description: "The bot won't get the links you put here", required: false },
        { name: 'limit', type: 4, description: 'Limit of links to generate', required: false },
      ]
    },
    {
      name: 'regen',
      type: 1,
      description: 'Regenerate links',
      options: [
        { name: 'account', type: 3, description: 'Account name', choices: accounts, required: true },
        { name: 'links', type: 3, description: 'Links to regen', required: true },
      ]
    },
    {
      name: 'revoke',
      type: 1,
      description: 'Revoke links',
      options: [
        { name: 'account', type: 3, description: 'Account name', choices: accounts, required: true },
        { name: 'links', type: 3, description: 'Links to revoke', required: true },
      ]
    },
    {
      name: 'generate',
      type: 1,
      description: 'Generate links',
      options: [
        { name: 'account', type: 3, description: 'Account name', choices: accounts, required: true },
        { name: 'type', type: 3, description: 'Type of link', choices: types, required: true },
        { name: 'amount', type: 4, description: 'Amount to generate', required: true },
      ]
    },
    /*{
      name: 'embed',
      type: 1,
      description: 'Create an embed message',
      options: [
        { name: 'id', type: 3, description: 'ID of the embed', required: true },
        { name: 'description', type: 3, description: 'Description of the embed', required: true },
        { name: 'title', type: 3, description: 'Title of the embed', required: false },
        { name: 'color', type: 3, description: 'Color of the embed in HEX', required: false },
        { name: 'thumbnail', type: 3, description: 'Thumbnail URL', required: false },
        { name: 'image', type: 3, description: 'Image URL', required: false },
        { name: 'footer', type: 3, description: 'Footer text', required: false }
      ]
    },
    {
      name: 'display_embed',
      type: 1,
      description: 'Display an embed message',
      options: [
        { name: 'id', type: 3, description: 'ID of the embed', required: true },
      ]
    },
    {
      name: 'delete_embed',
      type: 1,
      description: 'Delete an embed message',
      options: [
        { name: 'id', type: 3, description: 'ID of the embed', required: true },
      ]
    },
    {
      name: 'show_embeds',
      type: 1,
      description: 'Show all embed messages',
    },
    {
      "name": "drop",
      "type": 1,
      "description": "Drops an item to a user",
      "options": [
        {
          "name": 'user',
          "description": 'Recipient',
          "type": 6,
          "required": true,
        },
        {
          "name": 'item',
          "description": 'Item name',
          "type": 3,
          "choices": [
            {
              name: 'nitro boost',
              value: 'nitro boost'
            },
            {
              name: 'nitro basic',
              value: 'nitro basic'
            },
          ],
          "required": true,
        },
        {
          "name": 'quantity',
          "description": 'Amount to send',
          "type": 4,
          "required": true,
        },
        {
          "name": 'price',
          "description": 'Price paid',
          "type": 4,
          "required": false,
        },
        {
          "name": 'note',
          "description": 'Extra notes',
          "type": 3,
          "required": false,
        },
        {
          "name": 'mop',
          "description": 'Mode of Payment',
          "type": 3,
          "choices": [
            {
              name: 'gcash',
              value: 'gcash'
            },
            {
              name: 'paypal',
              value: 'paypal'
            },
          ],
          "required": false,
        },
      ]
    },
    {
      "name": "stocks",
      "type": 1,
      "description": "Shows a list of available stocks",
    },
    {
      "name": "resend",
      "type": 1,
      "description": "Resend a message through the bot",
      "options": [
        {
          "name": 'msg_ids',
          "description": 'Message IDs',
          "type": 3,
          "required": false,
        },
      ]
    },
    {
      "name": "orderstatus",
      "type": 1,
      "description": "Update order status",
      "options": [
        {
          "name": 'preset_status',
          "description": 'Preset order status',
          "type": 3,
          "choices": [
            {
              name: 'order noted',
              value: '<a:qqWhtShk_CuteClap:1138849011965624320> Order noted'
            },
            {
              name: 'submitted for processing',
              value: '⏳ Your order was submitted for processing',
            },
            {
              name: 'currently being processed',
              value: emojis.loading+' Your order is currently being processed',
            },
            {
              name: 'order completed',
              value: emojis.check+' Your order was completed',
            },
          ],
          "required": false,
        },
        {
          "name": 'custom_status',
          "description": 'Custom order status',
          "type": 3,
          "required": false,
        },
      ]
    },
    {
      "name": "order",
      "type": 1,
      "description": "Sends an order queue",
      "options": [
        {
          "name": 'user',
          "description": 'Recipient',
          "type": 6,
          "required": true,
        },
        {
          "name": 'product',
          "description": 'Product name',
          "type": 3,
          "required": true,
        },
        {
          "name": 'quantity',
          "description": 'Amount ordered',
          "type": 3,
          "required": true,
        },
        {
          "name": 'mop',
          "description": 'Mode of Payment',
          "type": 3,
          "choices": [
            {
              name: 'GCash',
              value: 'gcash'
            },
            {
              name: 'Robux',
              value: 'robux'
            },
            {
              name: 'Paypal',
              value: 'paypal'
            },
          ],
          "required": true,
        },
        {
          "name": 'price',
          "description": 'Price paid',
          "type": 4,
          "required": true,
        },
      ]
    },*/
  ],
};

/*
{
      name: "calculate",
      type: 1,
      description: "Calculate fee based on amount",
      options: [
        {
          "name": 'type',
          "description": 'Type of transaction',
          "type": 3,
          "choices": [
            {
              name: 'Robux Gamepass',
              value: 'robux'
            },
          ],
          "required": true,
        },
        { 
          name: 'amount', type: 10, required: true,
          description: 'Amount to calculate',
        },
      ]
    },
    */