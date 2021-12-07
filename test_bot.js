import Discord, {Intents, SnowflakeUtil} from 'discord.js';
import dotenv from 'dotenv';
import request from 'request';
// import * as fs from 'fs';
// import { validateURL } from 'ytdl-core';
import * as accumulated  from "./accumulator.cjs";

dotenv.config();
const client = new Discord.Client({intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
]});

var attributes;
// specific bot attributes
// async function open(){
//     attributes= fs.readFileSync('./attributes.txt','utf-8');
// }

// update bot commands
// async function updateCMD(){
//     attributes = fs.readFileSync('./attributes.txt','utf-8');
//     attributes.commands = accumulated['default'];
//     console.log('inside updateCMD:');
//     console.log(attributes.commands);
//     fs.writeFileSync('./attributes.txt',attributes);
// }

// on ready
client.once('ready',async ()=>{
    console.log(`Logged in as ${client.user.tag}`);
    attributes = {"active_status":true,"count":0};
    // fs.writeFileSync('./attributes.txt',attributes);

    // fetching commands
    attributes.commands = accumulated['default'];
    // await updateCMD();
})

const PREFIX = '.';

// event triggered when user messages
client.on('messageCreate',async message=>{

    // bot checker condition
    if(message.author.bot) return;
    
    // checking if bot is turned off or still active.
    if(message.content.startsWith('.shutdown')){
        message.reply('Off!!!');
        attributes.active_status = false;
        attributes.count++;
        // fs.writeFileSync('./attributes.txt',attributes);
    }else if(message.content.startsWith('.startbot')){
        message.reply('On!!!');
        attributes.active_status = true;
        attributes.count++;
        // fs.writeFileSync('./attributes.txt',attributes);
    }
    
    if(message.content.startsWith(PREFIX)){
        // incrementing count value
        // await open();
        attributes.count++;
        // fs.writeFileSync('./attributes.txt',attributes);
        
        // checking whether bot was turned off or not.
        if(!attributes.active_status){
            return message.reply('I\'m sleeping <:sleeping:786954379223367710>, don\'t interrupt.!!!');
            }
    
        // separating command parameters
        const [cmd,...residue] = message.content.trim()
        .substring(PREFIX.length)
        .split(/\s+/);
        // console.log(`${residue[0]}`);

        // retrieving manager of the guild(server)
        const serverManager = message.guild.members //.cache.get(snowflakeOfUserId);

        // menu-driven different operations
        switch(cmd){
            case 'kick':

                // checking for a valid id
                if(residue.length==0){
                    return message.channel.send(`Provide a valid userID u dickhead!!!`);
                }

                // converting userId entered by user to type snowflake
                var snowflakeOfUserId = residue[0].slice(3,residue[0].length - 1);
                console.log(`snowflake: ${snowflakeOfUserId}`);

                // checking if the userId matches the bot itself
                if(snowflakeOfUserId == client.user.id){
                    return message.reply('bsdk me khud ko kick nahi karunga');
                }
                
                // checking for permissions
                if(!message.member.permissions.has(0x0000000002))
                return message.channel.send(`Uh'oh! lacking permissions :(`);
                
                // working code tried and tested to kick mentioned user
                if(serverManager.cache.get(snowflakeOfUserId)){
                    serverManager.kick(snowflakeOfUserId,'dhemnagiri')
                    .then(()=>{
                        message.channel.send(`${residue[0]} was kicked!!!`);
                    })
                    .catch(()=>{
                        message.reply(`Something went wrong, operation unsuccessful :(`);
                    })
                }else{
                    message.reply(`User not found!!!`);
                }
                break;
            case 'ban':

                // checking for a valid id
                if(residue.length==0){
                    return message.channel.send(`Provide a valid userID u dickhead!!!`);
                }

                // converting userId entered by user to type snowflake
                var snowflakeOfUserId = residue[0].slice(3,residue[0].length - 1);
                console.log(`snowflake: ${snowflakeOfUserId}`);
                
                // checking if the userId matches the bot itself
                if(snowflakeOfUserId == client.user.id){
                    return message.reply('bsdk me khud ko ban nahi karunga');
                }
                
                // checking for permissions
                if(!message.member.permissions.has(0x0000000004))
                return message.channel.send(`Uh'oh! lacking permissions :(`);

                // working code tried and tested to ban mentioned user
                if(serverManager.cache.get(snowflakeOfUserId)){
                    serverManager.ban(snowflakeOfUserId)
                    .then(()=>{
                        message.channel.send(`${residue[0]} was banned!!!`);
                    })
                    .catch(()=>{
                        message.reply(`Something went wrong, operation unsuccessful :(`);
                    })
                }else{
                    message.reply(`User not found!!!`);
                }
                break;
            case 'invite':

                // checking for permissions
                if(!message.member.permissions.has(0x0000000001))
                return message.channel.send(`Uh'oh! lacking permissions :(`);

                const inviteOptions = {
                    temporary:false,
                    maxAge:86400,
                    maxUses:0
                };

                if(residue.length<3)
                return message.reply('Enter valid invite flags!!!')

                if(residue[0]=='f'){                // temporary link or not
                    inviteOptions.temporary = false;
                }else if(residue[0]=='t'){
                    inviteOptions.temporary = true;
                }

                if(!residue[1]){             // max days the invite should last
                    inviteOptions.maxAge=parseInt(residue[1])*24*60*60n;
                }else{
                    inviteOptions.maxAge=0;             // 0 means unlimited age
                }

                if(!residue[2]){                // max users allowed
                    inviteOptions.maxUses = parseInt(residue[2]);
                }else{
                    inviteOptions.maxUses = 1;
                }

                // creating actual invite
                const serverInvite = await message.guild.invites.create(message.channel,inviteOptions);
                message.reply(serverInvite.url);
                break;
            case 'hello':
                message.reply('``world\ndhemna``');
                break;
            case 'weather':
                if(!residue.length) return message.reply(`Give a valid city name<:angry:917836961056714812>`);
                const cityName = residue.join('');
                const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_APIKEY}`
                // const urlAlt = `api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=64f24adc5300e827cfe2c45b5450f697`
                
                // api request
                request(weatherUrl, function(error, response, body) {
                        let data = JSON.parse(body);
                        if (response.statusCode === 200) {
                            // console.log(data);
                            message.reply('``Weather update:-``');
                            const info = `Current Temperature: ${(data['main'].temp - 273.15).toFixed(2)} Celcius with\nMax. of: ${(data['main'].temp_max-273.15).toFixed(2)} Celcius and Min. of: ${(data['main'].temp_min-273.15).toFixed(2)} Celcius\nIt feels like <${(data['weather'][0]['main'])}>: ${(data['weather'][0]['description'])} with\nHumidity:${(data['main'].humidity).toFixed(2)}% and Pressure:${(data['main'].pressure/1013.25).toFixed(2)} atm\nAlso Visibility:${(data['visibility']).toFixed(2)} metre(s)`
                            message.channel.send('``'+`${info}`+'``');
                            // console.log(`The weather in your city durgapur is ${data.list[0].weather[0].description}`);
                        }
                    }
                );  
                break;
            case 'play':
                console.log(attributes.commands['play']);
                attributes.commands['play'].run(message,residue);
                // attributes.commands['play'].run(message,residue);
                // var userId = message.author.id;
                // var memberInsideGuild = await serverManager.fetch(userId);
                // if(!memberInsideGuild.voice.channel?.isVoice()){
                //     message.reply(`GANDU voice channel e dhok!!!<:face_with_symbols_over_mouth:917462080020426782>`);
                // }

                break;
        }
    }
})


client.login(process.env.DISCORD_SECRET_TOKEN);