const settings = require('../storage/settings_.js')
const {prefix, colors, theme, commands, permissions, emojis,} = settings
const others = require('../functions/others.js')
//Functions
const get = require('../functions/get.js')
const {getTime, chatAI, getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor} = get
const fetch = require('node-fetch');

const {makeCode, stringJSON, fetchKey, ghostPing, moderate, getPercentage, sleep, getPercentageEmoji, randomTable, scanString, requireArgs, getArgs, makeButton, makeRow} = others

async function log(msg) {
  let channel = await getChannel("1280710557825236992")
  console.log("🔴 New log: "+msg)
  await channel.send(msg)
}

const version = "Handler version: v2.0.2"

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
          count++
          let ip
          if (count > ips.length-1) count = 0
          ip = ips[count]
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
              /*'X-Originating-IP': ip,
              'X-Forwarded-For': ip,
              'X-Remote-IP': ip,
              'X-Remote-Addr': ip,
              'X-Client-IP': ip,
              'X-Host': ip,
              'X-Forwared-Host': ip,
              'X-Forwarded-For': ip,
              'X-Forwarded-For': ip,*/
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
            makeCode = await makeCode.json();
            let retry = makeCode.retry_after * 1000
            console.log("Rate limited. Retrying in "+retry+"ms...");
            await sleep(retry);
          } else if (makeCode.status == 404 && style !== null) {
            style = null
            retry = true
          }
          else {
            await log(emojis.warning + ' `[' + counter + '] - '+makeCode.status+'` Unable to generate code - `' + makeCode.statusText + '`')
            retry = false;
            unable = true
          }
        }
        if (counter < object.amount && unable) {
          billingIndex++;
        }
      }
      console.log(createdCodes)
      return { message: '` [' + counter + '] ` Generated Codes ['+object.type.toUpperCase()+']\n'+createdCodes+'-# '+version };
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
        
        let code = codes[i].code;
        let retry = true;
        // Handle rate limit
        while (retry) {
          count++
          let ip
          if (count > ips.length-1) count = 0
          ip = ips[count]
          // Authentication
          let auth = {
            method: 'DELETE',
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
              /*'X-Originating-IP': ip,
              'X-Forwarded-For': ip,
              'X-Remote-IP': ip,
              'X-Remote-Addr': ip,
              'X-Client-IP': ip,
              'X-Host': ip,
              'X-Forwared-Host': ip,
              'X-Forwarded-For': ip,
              'X-Forwarded-For': ip,*/
            },
          };
          let deleteCode = await fetch('https://discord.com/api/v9/users/@me/entitlements/gift-codes/'+code, auth);
          console.log("Revoke status: ", deleteCode.status);
          
          if (deleteCode.status == 204 || deleteCode.status == 200) {
            deletedCodes++;
            codes[i].status = emojis.trash;
            deletedString += codes[i].status+" "+code+"\n";
            retry = false;
          } else if (deleteCode.status == 429) {
            deleteCode = await deleteCode.json();
            let retry = deleteCode.retry_after * 1000
            console.log("Rate limited. Retrying in "+retry+"ms...");
            await sleep(retry); //retry
          } else {
            deletedString += codes[i].status+": `"+deleteCode.status+"` "+code+"\n";
            await log(deleteCode.status+": `"+deleteCode.statusText+"` "+code);
            retry = false;
          }
        }
        
        //await sleep(1000); // Sleep for 1 second between each request to avoid rate limits
      }
      return { message: "` ["+deletedCodes+"] ` Revoked Codes\n"+deletedString+'-# '+version, count: deletedCodes}
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
        data.push({ id: bill.sku_id, subscription: bill.sku_subscription_plan_id, type: bill.sku.slug+"-"+(bill.sku_price.toString().length >= 4 ? "yearly" : "monthly")})
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
        }
        if (counter >= object.limit) break
      }
    }
    return { message: "` ["+counter+"] ` Claimable Codes ["+object.type.toUpperCase()+"] "+codeString+'-# '+version}
  },
};


let count = 0
const ips = [
  "156.178.228.131",
  "229.234.147.217",
  "48.205.31.127",
  "93.250.1.214",
  "238.253.101.198",
  "197.147.50.6",
  "42.216.235.240",
  "114.145.31.117",
  "40.27.139.106",
  "139.71.189.164",
  "17.250.126.149",
  "241.165.74.248",
  "155.110.24.212",
  "249.208.130.207",
  "188.156.14.105",
  "206.86.122.89",
  "231.26.43.91",
  "88.1.133.246",
  "106.15.63.27",
  "95.99.98.81",
  "219.101.154.153",
  "191.28.92.247",
  "254.222.59.247",
  "168.207.246.128",
  "94.229.228.69",
  "78.161.162.253",
  "196.161.90.205",
  "125.124.33.75",
  "128.1.167.140",
  "19.253.250.209",
  "30.88.6.235",
  "107.117.202.215",
  "184.103.15.66",
  "100.69.32.220",
  "1.96.226.198",
  "186.68.230.68",
  "238.223.97.103",
  "254.232.94.82",
  "46.240.200.215",
  "217.10.171.49",
  "99.16.179.33",
  "213.51.207.115",
  "10.66.190.70",
  "228.202.232.93",
  "57.165.164.50",
  "162.246.236.231",
  "7.187.9.73",
  "200.13.81.137",
  "128.95.224.162",
  "250.142.94.125",
  "109.0.59.217",
  "31.247.9.172",
  "22.8.213.209",
  "250.46.165.172",
  "226.49.114.71",
  "243.30.251.180",
  "1.132.140.129",
  "1.230.8.229",
  "50.185.66.87",
  "124.57.33.226",
  "23.243.13.148",
  "228.116.228.203",
  "167.133.205.22",
  "89.226.176.147",
  "95.94.209.109",
  "229.46.40.99",
  "78.62.140.41",
  "109.194.108.14",
  "23.78.121.9",
  "63.33.24.162",
  "32.200.112.16",
  "44.140.219.118",
  "219.113.170.114",
  "73.247.116.1",
  "132.76.92.131",
  "104.171.25.33",
  "237.82.23.149",
  "158.250.174.203",
  "40.236.114.79",
  "188.54.100.86",
  "178.177.155.14",
  "110.225.167.168",
  "221.254.51.42",
  "120.25.120.139",
  "59.111.226.67",
  "250.13.154.139",
  "164.175.91.221",
  "37.40.70.235",
  "233.191.217.253",
  "158.27.13.177",
  "1.202.44.79",
  "225.202.10.164",
  "166.50.94.66",
  "231.111.241.42",
  "43.60.174.106",
  "179.27.220.136",
  "78.159.79.209",
  "63.37.37.192",
  "18.183.42.188",
  "194.245.240.161"
];