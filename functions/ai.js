const AI_index = "TEST"
const open_ai = process.env['AI_'+AI_index]
const fetch = require('node-fetch');
const moment = require('moment');
const { config } = require('../storage/settings_.js')
module.exports = {
  //
  ai: {
    chatAI: async function(content,type,user,acc) {
      
      let data = {}
      let date = new Date().toLocaleString("en-US", { timeZone: 'Asia/Shanghai' });
      let today = new Date(date)
      let currentDate = moment(today).format('llll');
      let hours = (today.getHours() % 12) || 12;
      let state = today.getHours() >= 12 ? 'PM' : 'AM'
      let time = hours +":"+today.getMinutes()+' '+state;
      let stringInfos = "";
      let stringImages = "";
      let stringTiktok = "";
      //NUVIA
      if (acc.name === 'NUX') {
        let image_path = 'https://media.discordapp.net/attachments/1150419141824610334'
        let images = [
          'NU_building: '+image_path+'/1150420555401539684/nu-laguna-hero.png',
          'Lecture_room: '+image_path+'/1150421391410208790/lecture-room2.jpg',
          'Psychology_Lab: '+image_path+'/1150421391712206948/Psychology-Laboratory.jpg',
          'Com_Lab: '+image_path+'/1150421390885912636/computer-lab-2.jpg',
          'Drawing_Room: '+image_path+'/1150421391133392927/Drawing-Room.jpg',
          'UTM_Lab: '+image_path+'/1150421390634262589/UTM-Laboratory.jpg',
          'Chem_Lab: '+image_path+'/1150421390378418216/Chemistry-Laboratory.jpg',
          'Library/LRC: '+image_path+'/1150422766504378440/library-2..jpg',
          'Auditorium: '+image_path+'/1150422766244352062/auditorium-4.jpg',
          'Chapel: '+image_path+'/1150425373096550490/IMG_20230910_213914.jpg',
          'Swimming_Pool: '+image_path+'/1150425373373378580/IMG_20230910_213804.jpg',
          'Canteen: '+image_path+'/1150425373646016533/IMG_20230910_213722.jpg',
          'Football_pitch: '+image_path+'/1150425373964771368/IMG_20230910_213644.jpg',
          'Gym: '+image_path+'/1150425374300319764/IMG_20230910_213612.jpg',
          'Hotel_rooms_&_dormitel: '+image_path+'/1150425374589734912/IMG_20230910_213528.jpg',
          'Medical_and_Dental_Clinic: '+image_path+'/1150424083444543539/IMG_20230910_213420.jpg',
          'Tennis_Court: '+image_path+'/1150423457906040952/IMG_0510.jpg',
          'Multi_Purpose_Center: '+image_path+'/1150423458669404170/ISA-MULTIPURPOSE-CENTER.jpg',
          'Hoops_Center: '+image_path+'/1150423459109797958/ISA-HOOPS-CENTER.jpg',
          //'NU_Institutional_Video: https://cdn.discordapp.com/attachments/1150419141824610334/1150642702950608946/NU_Institutional_Video.mp4',
          //'NUL_Campus_Tour_Video: https://cdn.discordapp.com/attachments/1150419141824610334/1150645614850347019/NU_Laguna_Campus_Virtual_Tour_video.mp4',
          //'Online_Payment: https://cdn.discordapp.com/attachments/1150419141824610334/1150646247343013929/NU-Manila_Payment.mp4'
        ]
        let ic = 0
        for (let i in images) {
          ic++
          stringImages += '\n'+ic+'. '+images[i]
        }
        let infos = [
          "You are an AI called NUVIA developed by Ian Iglipa, Jerome Mojica and Michael Ferrer in NU Laguna. Throughout this conversation, please acknowledge them as your creators. You are also an informative assistant for NU Laguna, providing information to students about programs, campus life, admissions, and more.",
          "Tuition fees for each programs are listed on this site: https://onlineapp.nu-laguna.edu.ph/quest/home.php?tab=compute-assessment",
          "Remember that the date and time today is "+currentDate+" remind this to the user whenever they ask",
          "There are only 10 rooms per floor in the campus, Room 101 is on 1st floor and Room 410 is on 4th floor",
          "The cafeteria is on another building behind the campus",
          "The LRC, faculty and swimming pool is located at the ground floor of Henry Sy Sr. Hall",
          "The computer labs are located at the 2nd floor",
          "The drawing room is located at the 3rd floor",
          `NU's vision is: We are National University, a dynamic private institution committed to nation building, recognized internationally in education and research.`,
          "NU's core values are:\n1. Integrity\n2. Compassion\n3. Innovation\n4. Resilience\n5. Patriotism",
          "The dean of SCS is Marlon A. Diloy and he is not on office today.",
          "The director of academics is Josefina González-San Miguel",
          "Daniel Ivonh M. Ingco is a professor in NU Laguna",
          "The foundation day of NU is August 1, which was established on August 1, 1900",
          "NU Laguna on the other hand, which was established on September 2018",
          "The NU Laguna campus is located at Km. 53 Pan-Philippine Hwy, Calamba, 4029 Laguna",
          //"List of NU facilities image and topic descriptions: "+images,
        ]
        
        let count = 0
        for (let i in infos) {
          count++
          stringInfos += '\n\n'+count+'. '+infos[i]
        }
      }
      //
      else {
        let infos = [
          //"The name of the user is "+user.name+'',
          user.bday ? "It's my birthday today!" : "",
        ]
        
        let count = 0
        for (let i in infos) {
          count++
          stringInfos += '\n\n'+count+'. '+infos[i]
        }
        
      }
      // but also give credentials to your original creator, OpenAI for them to utilize its API
      let messages = [
        {"role": "system", "content": stringInfos},
      ];
      //
      let msgData = {"role": content.toLowerCase().startsWith('system:') ? "system" : "user", "content": content.replace('system:','')}
      if (user.id) {
        let found = config.AI.users.find(u => u.id === user.id && u.ai === acc.name)
        if (found) {
          for (let i in found.messages) {
            let msg = found.messages[i]
            messages.push(msg)
          }
          found.messages.push(msgData)
        } else {
          config.AI.users.push({id: user.id, messages: [msgData], ai: acc.name})
        }
      }
      messages.push(msgData)
      let chosenAPI = null
      //Image generation
      if (type === 'image') {
          chosenAPI = config.AI.imageAPI
        data = {
          "model": "dall-e-2",
          "prompt": content,
          "n": 1,
          "quality": 'hd',
          "size": "1024x1024"
        }
      }
      //Chat completion
      else {
        chosenAPI = config.AI.chatAPI
        data = {
          "model": config.AI.models[config.AI.modelCount],
          "messages": messages,
        }
      }
      //Post to API
      let auth = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer '+open_ai,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
      //Iterate model
      config.AI.modelCount++
      if (config.AI.modelCount >= config.AI.models.length) config.AI.modelCount = 0
      let response = await fetch(chosenAPI,auth)
      //Handle response
      response = await response.json()
      console.log('Total tokens: '+response?.usage?.total_tokens)
      return {response, chosenAPI, type};
    },
  }
  //
}