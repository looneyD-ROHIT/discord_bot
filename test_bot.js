import Discord, {Intents} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
const client = new Discord.Client({intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
]});

client.on('ready',()=>{
    console.log(`Logged in as ${client.user.tag}`);
})

const PREFIX = '.';

client.on('messageCreate',async message=>{
    // bot checker condition
    if(message.author.bot) return;
    if(message.content.startsWith(PREFIX)){
        const [cmd,...residue] = message.content.trim()
        .substring(PREFIX.length)
        .split(/\s+/);
        if(residue.length==0){
            return message.channel.send(`Please provide an ID`);
        }
        message.reply(`${residue[0]} is the target user`);
        console.log(`${residue[0]}`);
        if(cmd === 'kick'){
            if(!message.member.permissions.has(0x0000000002))
            return message.channel.send(`U'r lacking permissions :(`);
            const memberToBeKicked = message.guild.members//.cache.get(`${residue[0]}`);
            // console.log(memberToBeKicked);
            memberToBeKicked.search({query:`${residue[0]}`})
            .then((temp)=>{
                console.log('found!!!');
                message.channel.send(`${residue[0]} was kicked!!!`);
                var id=memberToBeKicked.resolveId(residue[0]);
                // memberToBeKicked.kick(id,'dhemnagiri');
        });
            // if(memberToBeKicked){
            //     memberToBeKicked.kick()
            //     .then(()=>{
            //         message.channel.send(`${memberToBeKicked} was kicked!!!`);
            //     })
            //     .catch(()=>{
            //         message.reply(`Something went wrong, operation unsuccessful :(`);
            //     })
            // }else{
            //     message.reply(`User not found!!!`);
            // }
        }
    }


    message.channel.send('Instantiated successfully!!!');
    console.log('hi');
    if(message.content === 'hello'){
        message.reply({content:'world'});
    }
})


client.login(process.env.DISCORD_SECRET_TOKEN);