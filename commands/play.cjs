const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { joinVoiceChannel, 
        createAudioPlayer,
        createAudioResource } = require('@discordjs/voice');
module.exports = {
    alias: 'play',
    desc: 'Plays any valid youtube link!!!',
    async run(message,residue){             // function expression inside object
        // user as a GuildMember type
        const memInGld = await message.guild.members.fetch(message.author.id);

        // channel in which user is present
        const inChannel = memInGld.voice.channel;
        
        // checking presence of user in voice channel
        if(!inChannel)
        return message.reply(`GANDU voice channel e dhok!!!<:face_with_symbols_over_mouth:917462080020426782>`);

        // checking for permissions
        const perm = inChannel.permissionsFor(message.client.user);
        if(!(perm.has(0x0000100000)&&perm.has(0x0000200000)))
        return message.reply('I\'m lacking the necessary permisssions!!!');

        // checking for valid url
        if(!residue.length)
        return message.reply('GANDU thik kore url lekh!!!');

        // joining voice channel
        const joinStatus = joinVoiceChannel({
            channelId: inChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        const urlFinder = async (q) =>{
            const searchResult = await ytSearch(q);

            return (searchResult.videos.length>=1)?(searchResult.videos[0]):(null);
        }

        const target = await urlFinder(residue.join(''));

        

        if(target){
            const file = ytdl(target.url,{filter:'audioonly'});
            const player = createAudioPlayer();
            const resource = createAudioResource(file);
            async function play() {
                await player.play(resource);
                joinStatus.subscribe(player);
            }
            if(!file) return message.channel.send('Something wrong with video file!!!');
            // joinStatus.play(file,{seek:0,volume:1})
            // .on('finish',()=>{
            //     joinStatus.leave();
            // })

            play();

            await message.reply(`CurrentlyPlaying: ${target.title}`);

        }else{
            return message.reply('Video not found!!!');
        }


    }
}

// export default data;