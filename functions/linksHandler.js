const settings = require('../storage/settings_.js')
const {prefix, colors, theme, commands, permissions, emojis,} = settings
const others = require('../functions/others.js')

const fetch = require('node-fetch');

const {makeCode, stringJSON, fetchKey, ghostPing, moderate, getPercentage, sleep, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow} = others

module.exports = {
  generateLinks: async function (amount,sku) {
    try {
      // Get billing data
      let data = [];
      if (!sku) {
        let billings = await fetch('https://discord.com/api/v9/users/@me/billing/payments?limit=30', {
          method: 'GET',
          headers: {
            'authorization': process.env.User,
            'Content-Type': 'application/json',
          },
        });
        billings = await billings.json();
      
        for (let i in billings) {
          let bill = billings[i];
          if (!data.find((d) => d.id == bill.sku_id))
            data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id });
        }
      } else {
        data = sku
      }
      
      // Return if no billing
      if (data.length == 0) return { error: emojis.warning + ' No stock keeping unit (SKU) was found.' };

      let createdCodes = '';
      let counter = 0;
      let billingIndex = 0;

      // Generate codes
      for (let i = 0; i < amount; i++) {
        // Ensure we have billing data to use
        if (billingIndex >= data.length) {
          return { 
            error: `${emojis.warning} Not enough billing data to generate ${amount} gift codes. ` +
            `Generated only ${counter} codes:\n\n${createdCodes}` 
          };
        }
        
        // Get current billing info
        let currentBilling = data[billingIndex];
        // Authentication
        let auth = {
          method: 'POST',
          body: JSON.stringify({
            sku_id: currentBilling.id,
            subscription_plan_id: currentBilling.subscription,
            gift_style: 4,
          }),
          headers: {
            authorization: process.env.User,
            'Content-Type': 'application/json',
          },
        };
        let retry = true;
    
        // Handle rate limit
        while (retry) {
          let makeCode = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes', auth);
          console.log('Generation status: ', makeCode.status);

          // Check status
          if (makeCode.status == 200) {
            makeCode = await makeCode.json();
            counter++;
            createdCodes += counter.toString() + '. https://discord.gift/' + makeCode.code + '\n';
            retry = false;
          } else if (makeCode.status == 429) {
            console.log('Rate limited. Retrying in 3 seconds...');
            await sleep(3000); // Wait for 3 seconds before retrying
          } else {
            console.log(emojis.warning + ' Unable to generate code ` [' + counter + '] `\n`' + makeCode.status + '`');
            retry = false;
          }
        }

        await sleep(1000); // Sleep for 1 second between each request to avoid rate limits

        // If we've successfully generated a code, move to the next billing data if needed
        if (counter < amount && billingIndex < data.length) {
          billingIndex++;
        }
      }

      // Send codes
      return { message: emojis.check + ' Generated Codes ` [' + counter + '] `\n\n' + createdCodes };
    } catch (err) {
      return { error: emojis.warning + ' An unexpected error occurred.\n```diff\n- ' + err + '```' };
    }
  },
  revokeLinks: async function (codes) {
    try {
      // Get billing
      let data = []
      let deletedCodes = 0
      let deletedString = ""
      
      /*
      let billings = await fetch('https://discord.com/api/v9/users/@me/billing/payments?limit=30',{ method: 'GET', headers: {  'authorization': process.env.User, 'Content-Type': 'application/json' } })
      billings = await billings.json();
      
      for (let i in billings) {
        let bill = billings[i]
        if (!data.find(d => d.id == bill.sku_id)) {
          data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id})
        }
      }
        
      if (data.length == 0) return { error: emojis.warning+" No stock keeping unit (SKU) was found."}
      */
      
      for (let i in codes) {
        let auth = { method: 'DELETE', headers: { 'authorization': process.env.User, 'Content-Type': 'application/json' } };
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
            deletedString += codes[i].status+" "+code+"\n";
            console.log(deleteCode);
            retry = false;
          }
        }

        await sleep(1000); // Sleep for 1 second between each request to avoid rate limits
      }
      return { message: "Revoked Codes ` ["+deletedCodes+"] `\n"+deletedString, count: deletedCodes}
    } catch (err) {
      return { error: emojis.warning+" An unexpected error occured.\n```diff\n- "+err+"```"}
    }
  },
  fetchLinks: async function () {
    //
    let auth = { method: 'GET', headers: { 'authorization': process.env.User, 'Content-Type': 'application/json' } }
    let billings = await fetch('https://discord.com/api/v9/users/@me/billing/payments?limit=30',auth)
    billings = await billings.json();
    //
    let data = []
    let codes = []
    let codeString = ""
    let codesCount = 0
    // Get all billing
    for (let i in billings) {
      let bill = billings[i]
      if (!data.find(d => d.id == bill.sku_id)) {
        data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id})
      }
    }
    
    if (data.length == 0) return { error: emojis.warning+" No stock keeping unit (SKU) was found."}
    // Collect codes
    for (let i in data) {
      let found = data[i]
      let response = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes?sku_id='+found.id+'&subscription_plan_id='+found.subscription,auth)
      response = await response.json()
      let counter = 0
      codeString += "\n` SKU ` "+found.id+"\n` PLAN ` "+found.subscription+"\n"
      for (let i in response) {
        codesCount++
        if (!codes.find(c => c == response[i].code)) {
          codes.push(response[i].code)
          counter++
          codeString += counter.toString()+". https://discord.gift/"+response[i].code+"\n"
        }
      }
    }
    return { message: "Collected Codes ` ["+codesCount+"] `"+codeString}
  },
};