import Discord, { Intents, SnowflakeUtil } from 'discord.js';
import Distube from 'distube'
import dotenv from 'dotenv';
import request from 'request';
import fs from 'fs'
import * as data from './status.cjs'
var attributes = data.default;

// import * as accumulated  from "./accumulator.cjs";
dotenv.config();

const PREFIX = '-';

const client = new Discord.Client({
    intents: 32767,
});

const distube = new Distube.default(client, {
    emitNewSongOnly: false,
    searchSongs: 0,
    emptyCooldown: 300,
    nsfw: true
});

const status = (queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"
    }\` | Loop: \`${queue.repeatMode
        ? queue.repeatMode == 2
            ? "All Queue"
            : "This Song"
        : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// distube events
distube.on("playSong", (queue, song) => {
    const songInfo = new Discord.MessageEmbed()
        .setAuthor(`${client.user.tag.slice(0, -5)}`, `https://bit.ly/3dv0UAT`)
        .setColor("RANDOM")
        .setTitle("😊🎶 Currently Playing:-")
        .setThumbnail(song.thumbnail)
        .setDescription(`\`<${song.name}>\` - \`LINK: <${song.url}>\``)
        .addField("Requested by: ", `${song.user}`, true)
        .addField("<DURATION> : ", `${song.formattedDuration.toString()}`, true)
        .addField("INFO: ", status(queue), true)
        .setFooter(
            `belongs to looneyD-ROHIT`,
            song.user.displayAvatarURL({ dynamic: true })
        );

    queue.textChannel.send({ embeds: [songInfo] });
});

distube.on("addSong", (queue, song) => {
    const songInfo = new Discord.MessageEmbed()
        .setAuthor(`${client.user.tag.slice(0, -5)}`, `https://bit.ly/3dv0UAT`)
        .setColor("RANDOM")
        .setTitle("😊 Successfully Added to Queue:-")
        .setThumbnail(song.thumbnail)
        .setDescription(`\`<${song.name}>\` - \`LINK: <${song.url}>\``)
        .addField("Requested by: ", `${song.user}`, true)
        .addField("<DURATION> : ", `${song.formattedDuration.toString()}`, true)
        .addField("INFO: ", status(queue), true)
        .setFooter(
            `belongs to looneyD-ROHIT`,
            song.user.displayAvatarURL({ dynamic: true })
        );

    queue.textChannel.send({ embeds: [songInfo] });
});
distube.on("addList", (queue, playlist) => {
    const songInfo = new Discord.MessageEmbed()
        .setAuthor(`${client.user.tag.slice(0, -5)}`, `https://bit.ly/3dv0UAT`)
        .setColor("RANDOM")
        .setTitle("😊 Successfully Added to Queue:-")
        .setThumbnail(playlist.thumbnail)
        .setDescription(`\`<${playlist.name}>\` - \`LINK: <${playlist.url}>\``)
        .addField("Requested by: ", `${playlist.user}`, true)
        .addField("<DURATION> : ", `${playlist.formattedDuration.toString()}`, true)
        .addField("INFO: ", status(queue), true)
        .setFooter(
            `belongs to looneyD-ROHIT`,
            playlist.user.displayAvatarURL({ dynamic: true })
        );

    queue.textChannel.send({ embeds: [songInfo] });
});


// on ready
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("Your Activity", { type: 'WATCHING' });
    client.user.setStatus("idle");
    // attributes = { "active_status": true, "count": 0 };
    // fs.writeFileSync('./attributes.txt',attributes);

    // fetching commands
    // attributes.commands = accumulated['default'];
    // await updateCMD();
})

// event triggered when usersends messages
client.on('messageCreate', async message => {
    console.log(attributes);
    // bot checker condition
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    // checking if bot is turned off or still active.
    if (message.content.startsWith(`${PREFIX}shutdown`)) {
        if (message.guild.ownerId !== message.member.id)
            return message.reply('`U do not have permission to use that command`');
        attributes.active_status = false;
        attributes.count++;
        fs.writeFileSync('./status.cjs', `module.exports=${JSON.stringify(attributes)}`);
        return message.reply('Off!!!');
    } else if (message.content.startsWith(`${PREFIX}startbot`)) {
        if (message.guild.ownerId !== message.member.id)
            return message.reply('`U do not have permission to use that command`');
        attributes.active_status = true;
        attributes.count++;
        fs.writeFileSync('./status.cjs', `module.exports=${JSON.stringify(attributes)}`);
        return message.reply('On!!!');
    }

    if (message.content.startsWith(PREFIX)) {

        attributes.count++;

        // checking whether bot was turned off or not.
        if (!attributes['active_status']) {
            return message.reply('I\'m sleeping <:sleeping:786954379223367710>, don\'t interrupt.!!!');
        }

        // separating command parameters
        const [cmd, ...residue] = message.content.trim().toLowerCase()
            .substring(PREFIX.length)
            .split(/\s+/);

        // retrieving manager of the guild(server)
        const serverManager = message.guild.members //.cache.get(snowflakeOfUserId);

        const searchKeyword = residue.join(" ");
        const vChannel = message.member.voice?.channel;
        const queue = distube.getQueue(message.guild.id);

        // menu-driven different operations
        switch (cmd) {
            case 'kick':

                // checking for a valid id
                if (residue.length == 0) {
                    return message.channel.send(`Provide a valid userID u dickhead!!!`);
                }

                // converting userId entered by user to type snowflake
                var snowflakeOfUserId = `${residue[0].slice(3, residue[0].length - 1)}`;
                console.log(`snowflake: ${snowflakeOfUserId}`);

                // checking if the userId matches the bot itself
                if (snowflakeOfUserId == client.user.id) {
                    return message.reply('bsdk me khud ko kick nahi karunga');
                }

                // checking for permissions
                if (!message.member.permissions.has(0x0000000002))
                    return message.channel.send(`Uh'oh! lacking permissions :(`);

                // working code tried and tested to kick mentioned user
                if (serverManager.cache.get(snowflakeOfUserId)) {
                    serverManager.kick(snowflakeOfUserId, 'dhemnagiri')
                        .then(() => {
                            message.channel.send(`${residue[0]} was kicked!!!`);
                        })
                        .catch(() => {
                            message.reply(`Something went wrong, operation unsuccessful :(`);
                        })
                } else {
                    message.reply(`User not found!!!`);
                }
                break;
            case 'ban':

                // checking for a valid id
                if (residue.length == 0) {
                    return message.channel.send(`Provide a valid userID u dickhead!!!`);
                }

                // converting userId entered by user to type snowflake
                var snowflakeOfUserId = residue[0].slice(3, residue[0].length - 1);
                console.log(`snowflake: ${snowflakeOfUserId}`);

                // checking if the userId matches the bot itself
                if (snowflakeOfUserId == client.user.id) {
                    return message.reply('bsdk me khud ko ban nahi karunga');
                }

                // checking for permissions
                if (!message.member.permissions.has(0x0000000004))
                    return message.channel.send(`Uh'oh! lacking permissions :(`);

                // working code tried and tested to ban mentioned user
                if (serverManager.cache.get(snowflakeOfUserId)) {
                    serverManager.ban(snowflakeOfUserId)
                        .then(() => {
                            message.channel.send(`${residue[0]} was banned!!!`);
                        })
                        .catch(() => {
                            message.reply(`Something went wrong, operation unsuccessful :(`);
                        })
                } else {
                    message.reply(`User not found!!!`);
                }
                break;
            case 'invite':

                // checking for permissions
                if (!message.member.permissions.has(0x0000000001))
                    return message.channel.send(`Uh'oh! lacking permissions :(`);

                const inviteOptions = {
                    temporary: false,
                    maxAge: 86400,
                    maxUses: 0
                };

                if (residue.length < 3)
                    return message.reply('Enter valid invite flags!!!')

                if (residue[0] == 'f') {                // temporary link or not
                    inviteOptions.temporary = false;
                } else if (residue[0] == 't') {
                    inviteOptions.temporary = true;
                }

                if (!residue[1]) {             // max days the invite should last
                    inviteOptions.maxAge = parseInt(residue[1]) * 24 * 60 * 60n;
                } else {
                    inviteOptions.maxAge = 0;             // 0 means unlimited age
                }

                if (!residue[2]) {                // max users allowed
                    inviteOptions.maxUses = parseInt(residue[2]);
                } else {
                    inviteOptions.maxUses = 1;
                }

                // creating actual invite
                const serverInvite = await message.guild.invites.create(message.channel, inviteOptions);
                message.reply(serverInvite.url);
                break;
            case 'hello':
                message.reply('``world`');
                break;
            case 'weather':
                if (!residue.length) return message.reply(`Give a valid city name<:angry:917836961056714812>`);
                const cityName = residue.join('');
                const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_APIKEY}`
                // const urlAlt = `api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=64f24adc5300e827cfe2c45b5450f697`

                // api request
                request(weatherUrl, function (error, response, body) {
                    let data = JSON.parse(body);
                    if (response.statusCode === 200) {
                        // console.log(data);
                        message.reply('``Weather update:-``');
                        const info = `Current Temperature: ${(data['main'].temp - 273.15).toFixed(2)} Celcius with\nMax. of: ${(data['main'].temp_max - 273.15).toFixed(2)} Celcius and Min. of: ${(data['main'].temp_min - 273.15).toFixed(2)} Celcius\nIt feels like <${(data['weather'][0]['main'])}>: ${(data['weather'][0]['description'])} with\nHumidity:${(data['main'].humidity).toFixed(2)}% and Pressure:${(data['main'].pressure / 1013.25).toFixed(2)} atm\nAlso Visibility:${(data['visibility']).toFixed(2)} metre(s)`
                        message.channel.send('``' + `${info}` + '``');
                        // console.log(`The weather in your city durgapur is ${data.list[0].weather[0].description}`);
                    }
                }
                );
                break;
            case 'ping':
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("📶PING INFO:📶")
                            .setDescription(`PING: \`${client.ws.ping}\``)
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });

                break;
            case 'play':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                // checking for a valid search keyword
                if (!searchKeyword) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Enter a valid song name/URL`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                // playing the appropriate searchKeyword
                distube.play(message, searchKeyword);
                break;
            case 'pause':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue.playing ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // pausing the queue
                queue.pause();

                // providing necessary details in chat
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("PAUSED!!!")
                            .setDescription(`Song paused by: ${message.author}`)
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'resume':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // resuming the queue
                queue.resume();

                // providing necessary details in chat
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("RESUMED😊🎶")
                            .setDescription(`Song resumed by: ${message.author}`)
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'next':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue ||
                    !message.guild.me.voice.channel ||
                    !queue.playing ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                var flag = queue.songs.length;
                if (flag > 1) {
                    // skipping the track
                    queue.skip();

                    // providing necessary details in chat
                    message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle("SKIPPED")
                                .setDescription(`Song skipped by: ${message.author}`)
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                } else {
                    return message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle("ATTENTION!")
                                .setDescription(`No more songs exist: ${message.author}`)
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                break;
            case 'previous':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue ||
                    !message.guild.me.voice.channel ||
                    !queue.playing ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                var flag = queue.previousSongs.length
                // previous 1 track
                if (flag) {
                    queue.previous();

                    // providing necessary details in chat
                    return message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle("SKIPPED ONE STEP BACK")
                                .setDescription(`Song changed to previous by: ${message.author}`)
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                } else {
                    return message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle("ATTENTION!")
                                .setDescription(`No previous songs exist: ${message.author}`)
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                break;
            case 'now':
                // checking for empty queue
                if (
                    !queue ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                let song = queue.songs[0];
                let embed = new Discord.MessageEmbed()
                    .setAuthor(
                        `${message.member.displayName}`,
                        `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                    )
                    .setColor("RANDOM")
                    .setTitle(`Now Playing🎶🎶: ${song.name}`)
                    .setURL(song.url)
                    .setThumbnail(song.thumbnail)
                    .setDescription(`INFO🎶: requested by ${message.author}`)
                    .addFields([
                        {
                            name: "<Duration>",
                            value: `<!> ${song.formattedDuration.toString()}`,
                            inline: true,
                        },
                        {
                            name: "<User>",
                            value: `<!> ${song.user}`,
                            inline: true,
                        },
                        {
                            name: "<Views>",
                            value: `<!> ${song.views.toLocaleString()}`,
                            inline: true,
                        },
                    ])
                    .setFooter(
                        `belongs to looneyD-ROHIT`,
                        message.author.displayAvatarURL({ dynamic: true })
                    );
                // SENDING the info to chat
                message.channel.send({ embeds: [embed] });
                break;
            case 'list':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // retrieving songs from queue
                if (queue.playing || queue.songs.length) {
                    let embedQueued = queue.songs.map((song, index) => {
                        return `${index + 1} [${song.name}](${song.url}) \`[${song.formattedDuration}]\``
                    })


                    // providing necessary details in chat
                    message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle(`QUEUED INFO🎶: ${message.guild.name}`)
                                .setDescription(`${embedQueued.join("\n")}`.substr(0, 3000))
                                .addField("Queue info requested by: ",
                                    `${message.author}`,
                                    true,
                                )
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                } else {
                    // providing necessary details in chat
                    message.channel.send({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RANDOM")
                                .setTitle("QUEUED INFO🎶: ${message.guild.name}")
                                .setDescription(`\`<!> Nothing Found in Queue\``)
                                .addField("Queue info requested by: ",
                                    `${message.author}`,
                                    true,
                                )
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });

                }
                break;
            case 'volume':
                // checking voice channel existence
                if (!vChannel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`U'r requested to join a voice channel`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // checking for empty queue
                if (
                    !queue ||
                    !message.guild.me.voice.channel ||
                    !queue.playing ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // converting to integer
                var amt = null;
                if (Number(searchKeyword)) amt = parseInt(searchKeyword);
                else {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription(
                                    "`Abe chutiye 🤬 thik se volume ka value input kar`"
                                )
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                // setting volume to given limit
                queue.setVolume(amt);

                // providing necessary details in chat
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("VOLUME🎶:")
                            .setDescription(
                                `Volume changed to:  \`${amt}\` requested by ${message.author}`
                            )
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'seek':
                // checking for empty queue
                if (
                    !queue ||
                    !queue.playing
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // converting to integer
                var amt = null;
                if (Number(searchKeyword)) amt = parseInt(searchKeyword);
                else {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`Abe chutiye 🤬 thik se seek ka value input kar`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // seeking to mentioned time
                queue.seek(amt);

                // providing necessary details in chat
                return message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("SEEKED🎶:")
                            .setDescription(
                                `Seeked to:  \`${amt}\` requested by ${message.author}`
                            )
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'stop':
                // checking for empty queue
                if (
                    !queue ||
                    !queue.songs.length
                ) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("ORANGE")
                                .setTitle("ATTENTION!")
                                .setDescription("`Queue Empty, nothing playing!!!`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }

                // stopping the queue
                queue.stop();

                // providing necessary details in chat
                message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("STOPPED PLAYING!!!🎶:")
                            .setDescription(`Stopped, requested by: ${message.author}😶‍🌫️`)
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'auto':
                if (searchKeyword == 't') {
                    queue.autoplay = true;
                } else if (searchKeyword == 'f') {
                    queue.autoplay = false;
                }
                else {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(
                                    `${message.member.displayName}`,
                                    `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                                )
                                .setColor("RED")
                                .setTitle("ATTENTION!")
                                .setDescription("`Abe chutiye 🤬 thik se autoplay ka flag input kar`")
                                .setFooter(
                                    `belongs to looneyD-ROHIT`,
                                    message.author.displayAvatarURL({ dynamic: true })
                                ),
                        ],
                    });
                }
                // providing necessary details in chat
                return message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("AUTOPLAY INFO🎶:")
                            .setDescription(
                                `Autoplay set to:  \`${searchKeyword}\` requested by ${message.author}`
                            )
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            case 'help':
                const manual = `ℙℝ𝔼𝔽𝕀𝕏(-)\n
                                -𝗸𝗶𝗰𝗸 [𝘁𝗮𝗴 𝘂𝘀𝗲𝗿]: <:leg:918402517266747402> 𝐊𝐈𝐂𝐊𝐒 the tagged user\n
                                -𝗯𝗮𝗻 [𝘁𝗮𝗴 𝘂𝘀𝗲𝗿]: <:no_entry_sign:918402674557337611> 𝐁𝐀𝐍𝐒 the tagged user\n
                                -𝗽𝗹𝗮𝘆 [𝘀𝗼𝗻𝗴 𝗻𝗮𝗺𝗲/𝘂𝗿𝗹]: <:play_pause:918395008967655475> 𝐏𝐋𝐀𝐘𝐒 the song\n
                                -𝗽𝗮𝘂𝘀𝗲: <:pause_button:918394730256158730> 𝐏𝐀𝐔𝐒𝐄 the current playing\n
                                -𝗿𝗲𝘀𝘂𝗺𝗲: <:arrow_forward:918394526069047336> 𝐑𝐄𝐒𝐔𝐌𝐄𝐒 from the paused position\n
                                -𝗻𝗲𝘅𝘁: 𝐒𝐊𝐈𝐏 the track <:track_next:918395167617216513> 𝐅𝐎𝐑𝐖𝐀𝐑𝐃\n
                                -𝗽𝗿𝗲𝘃𝗶𝗼𝘂𝘀: 𝐒𝐊𝐈𝐏 the track <:track_previous:918395301738463273> 𝐁𝐀𝐂𝐊𝐖𝐀𝐑𝐃\n
                                -𝘀𝗲𝗲𝗸 [𝘁𝗶𝗺𝗲 𝗶𝗻 𝘀𝗲𝗰𝗼𝗻𝗱𝘀]: <:fast_forward:918395837921521775> 𝐒𝐄𝐄𝐊 to the time\n
                                -𝘀𝘁𝗼𝗽: <:octagonal_sign:918396415456202854> 𝐒𝐓𝐎𝐏 playing and 𝐋𝐄𝐀𝐕𝐄 voice channel\n
                                -𝗻𝗼𝘄: see details of <:green_circle:918396608977186836> 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐏𝐋𝐀𝐘𝐈𝐍𝐆\n
                                -𝗹𝗶𝘀𝘁: see details of the <:page_with_curl:918396736152674345> 𝐐𝐔𝐄𝐔𝐄𝐃 𝐒𝐎𝐍𝐆𝐒\n
                                -𝘃𝗼𝗹𝘂𝗺𝗲 [𝘃𝗮𝗹𝘂𝗲 𝗶𝗻 𝘄𝗵𝗼𝗹𝗲 𝗻𝗼.]: change <:loud_sound:918396895292956712> 𝐕𝐎𝐋𝐔𝐌𝐄\n
                                -𝗮𝘂𝘁𝗼 [𝘁/𝗳]: change <:auto_rickshaw:918397088260325376> 𝐀𝐔𝐓𝐎𝐏𝐋𝐀𝐘 status\n
                                -help: open <:sos:918397239565631539> 𝐌𝐀𝐍𝐔𝐀𝐋\n`
                return message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("USER MANUAL😊🟢:")
                            .setDescription(
                                `${manual}requested by ${message.author}`
                            )
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
                break;
            default:
                return message.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(
                                `${message.member.displayName}`,
                                `${message.member.avatar || "https://bit.ly/3dv0UAT"}`
                            )
                            .setColor("RANDOM")
                            .setTitle("ATTENTION!😡")
                            .setDescription(`NOT a valid command: ${message.author}😶‍🌫️`)
                            .setFooter(
                                `belongs to looneyD-ROHIT`,
                                message.author.displayAvatarURL({ dynamic: true })
                            ),
                    ],
                });
        }
    }
})


client.login(process.env.DISCORD_SECRET_TOKEN);