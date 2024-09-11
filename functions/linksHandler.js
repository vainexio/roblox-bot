const settings = require('../storage/settings_.js')
const {prefix, colors, theme, commands, permissions, emojis,} = settings
const others = require('../functions/others.js')
//Functions
const get = require('../functions/get.js')
const {getTime, chatAI, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor} = get
const fetch = require('node-fetch');

const {makeCode, stringJSON, fetchKey, ghostPing, moderate, getPercentage, sleep, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow} = others

async function log(msg) {
  //let channel = await getChannel("1280710557825236992")
  console.log("🔴 New log: "+msg)
  //await channel.send(msg)
}
module.exports = {
  generateLinks: async function (object) { //amount,sku,token,type
    try {
      let price = 0
      let finalType = object.type
      if (object.type == "nitro") price = 999
      else if (object.type == "nitro-basic") price = 299
      else if (object.type == "nitro-yearly") { price = 9999, finalType = "nitro" }
      else if (object.type == "basic-yearly") { price = 2999, finalType = "nitro-basic" }
      let token = process.env[object.account]
      // Get billing data
      let data = [];
      if (!object.sku) {
        let billings = await fetch('https://discord.com/api/v9/users/@me/billing/payments', {
          method: 'GET',
          headers: {
            'authorization': token,
            'Content-Type': 'application/json',
          },
        });
        if (billings.status == 401) return { error: emojis.warning + '`'+billings.status+'`: '+billings.statusText }
        billings = await billings.json();
        for (let i in billings) {
          let bill = billings[i];
          if (!data.find((d) => d.id == bill.sku_id && d.subscription == bill.sku_subscription_plan_id) && bill?.sku?.slug == finalType && bill?.sku_price == price) {
            //console.log(bill)
            data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id });
          }
        }
      } else {
        data = object.sku
      }
      // Return if no billing
      if (data.length == 0) return { error: emojis.warning + ' No stock keeping unit was found.' };

      let createdCodes = '';
      let counter = 0;
      let billingIndex = 0;
      let style = 4
      // Generate codes
      while (object.amount > counter) {
        // Ensure we have billing data to use
        if (billingIndex >= data.length) {
          counter == object.amount
          return { error: `${emojis.warning} Not enough billing data to generate ${object.amount} gift codes.\n`+`Generated only ${counter} code(s):\n\n${createdCodes}` };
        }
        // Get current billing info
        let currentBilling = data[billingIndex];
        let retry = true;
        let unable = false
        // Handle rate limit
        while (retry) {
          // Authentication
          let auth = {
            method: 'POST',
            body: JSON.stringify({
              sku_id: currentBilling.id,
              subscription_plan_id: currentBilling.subscription,
              gift_style: style,
            }),
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
          };
          let makeCode = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes', auth);
          console.log('Generation status: ', makeCode.status);

          // Check status
          if (makeCode.status == 200) {
            makeCode = await makeCode.json();
            counter++;
            console.log(makeCode.code)
            createdCodes += counter.toString() + '. https://discord.gift/' + makeCode.code + '\n';
            retry = false;
          } else if (makeCode.status == 429) {
            console.log('Rate limited. Retrying in 3 seconds...');
            await sleep(3000); // Wait for 3 seconds before retrying
          } else if (makeCode.status == 404 && style !== null) {
            style = null
            retry = true
          }
          else {
            await log(emojis.warning + '` [' + counter + '] - '+makeCode.status+'` Unable to generate code - `' + makeCode.statusText + '`')
            retry = false;
            unable = true
          }
        }
        await sleep(1000); // Sleep for 1 second between each request to avoid rate limits
        if (counter < object.amount && unable) {
          billingIndex++;
        }
      }
      console.log(createdCodes)
      return { message: '` [' + counter + '] ` Generated Codes ['+object.type.toUpperCase()+']\n' + createdCodes };
    } catch (err) {
      console.log(err)
      return { error: emojis.warning + ' An unexpected error occurred.\n```diff\n- ' + err + '```' };
    }
  },
  revokeLinks: async function (codes,acc) {
    try {
      let token = process.env[acc]
      // Get billing
      let data = []
      let deletedCodes = 0
      let deletedString = ""
      
      for (let i in codes) {
        let auth = { method: 'DELETE', headers: { 'authorization': token, 'Content-Type': 'application/json' } };
        let code = codes[i].code;
        let retry = true;
        // Handle rate limit
        while (retry) {
          let deleteCode = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes/'+code, auth);
          console.log("Revoke status: ", deleteCode.status);
          
          if (deleteCode.status == 204 || deleteCode.status == 200) {
            deletedCodes++;
            codes[i].status = emojis.trash;
            deletedString += codes[i].status+" "+code+"\n";
            retry = false;
          } else if (deleteCode.status == 429) {
            console.log("Rate limited. Retrying in 3 seconds...");
            await sleep(3000); // Wait for 3 seconds before retrying
          } else {
            deletedString += codes[i].status+": `"+deleteCode.status+"` "+code+"\n";
            await log(deleteCode.status+": `"+deleteCode.statusText+"` "+code);
            retry = false;
          }
        }

        await sleep(1000); // Sleep for 1 second between each request to avoid rate limits
      }
      return { message: "` ["+deletedCodes+"] ` Revoked Codes\n"+deletedString, count: deletedCodes}
    } catch (err) {
      return { error: emojis.warning+" An unexpected error occured.\n```diff\n- "+err+"```"}
    }
  },
  fetchLinks: async function (object) { // exclude,limit,token
    //
    let price = 0
    let finalType = object.type
    if (object.type == "nitro") price = 999
    else if (object.type == "nitro-basic") price = 299
    else if (object.type == "nitro-yearly") { price = 9999, finalType = "nitro" }
    else if (object.type == "basic-yearly") { price = 2999, finalType = "nitro-basic" }
    //
    let token = process.env[object.account]
    //
    let auth = { method: 'GET', headers: { 'authorization': token, 'Content-Type': 'application/json' } }
    let billings = await fetch('https://discord.com/api/v9/users/@me/billing/payments',auth)
    if (billings.status == 401) return { error: emojis.warning + '`'+billings.status+'`: '+billings.statusText }
    billings = await billings.json();
    //
    let data = []
    let codes = []
    let codeString = ""
    let counter = 0
    // Get all billing
    for (let i in billings) {
      let bill = billings[i]
      if (!data.find(d => d.id == bill.sku_id && d.subscription == bill.sku_subscription_plan_id) && ((bill.sku?.slug == finalType && bill?.sku_price == price) || object.type == "all")) {
        data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id, type: bill.sku.slug+":  "+bill.sku_price})
      }
    }
    
    if (data.length == 0) return { error: emojis.warning+" No stock keeping unit was found."}
    // Collect codes
    for (let i in data) {
      let found = data[i]
      let response = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes?sku_id='+found.id+'&subscription_plan_id='+found.subscription,auth)
      response = await response.json()
      codeString += "\n` [SKU] ` "+found.id+"\n` [TYPE] ` "+found.type+"\n"
      //console.log(response[0])
      for (let i in response) {
        if (!codes.find(c => c == response[i].code) && response[i].uses == 0 && !object.exclude.find(e => e.code == response[i].code)) {
          codes.push(response[i].code)
          counter++
          codeString += counter.toString()+". discord.gift/"+response[i].code+"\n"
          if (counter >= object.limit) break
        }
        if (counter >= object.limit) break
      }
    }
    return { message: "` ["+counter+"] ` Claimable Codes ["+object.type.toUpperCase()+"] "+codeString}
  },
};