const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ComponentType, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const mongoFindOne = require('../player/mongoFindOne');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('Show all guilds you are member of'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        //get player info
        const player = await mongoFindOne(interaction.user.id);
        const playerInfo = await fetch(`https://api.guildwars2.com/v2/account?access_token=${player.api[0]}`).then((response) => {
            return response.json();
        }).then((data) => {
            return data;
        });
        const guilds = playerInfo.guilds;
        const guildInfo = await getGuildsInfo(guilds, player.api[0]);
        const guildsEmbed = new EmbedBuilder()      //create Embed
            .setColor('#F8F272')
            .setAuthor({
                name: `${playerInfo.name}`,
                iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.jpeg`
            })
            .setDescription('These are the guilds you are currently joined')


        const guildSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('guildMenu')
            .setPlaceholder(`Choose a guild`)

        guildInfo.forEach((guild) => {
            guildsEmbed.addFields({
                name: `${guild.name}`,
                value: `└Level: ${guild.level} | Members: ${guild.member_count} | Aetherium: ${guild.aetherium} | Favor: ${guild.favor}`
            })
            guildSelectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${guild.name}`)
                    .setValue(guild.id)
            )
        });

        const selectMenu = new ActionRowBuilder()
            .addComponents(guildSelectMenu)

        const rep = await interaction.editReply({ 
            embeds: [guildsEmbed],
            components: [selectMenu],
            ephemeral: true
        });

        const collector = rep.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 15000
        });

        collector.on('collect', async i => {
            let guild = guildInfo.find(g => g = i.values[0]);
            const guildInfoEmbed = new EmbedBuilder()
                .setColor('#2A7754')
                .setTitle(`${guild.name} [${guild.tag}]`)
                .setThumbnail(`https://data.gw2.fr/guild-emblem/name/${guild.name}/256.png`.toString().url)
                .addFields(
                    { name: 'Message of the day', value: `${guild.motd}` },
                    { name: 'Level', value: `${guild.level}`, inline: true },
                    { name: 'Members', value: `${guild.member_count}`, inline: true},
                    { name: 'Aetherium', value: `${guild.aetherium}`, inline: true },
                    { name: 'Favor', value: `${guild.favor}`, inline: true },
                );

            await i.reply({ 
                embeds: [guildInfoEmbed],
                ephemeral: true,
            });
        });

        
    }
}

async function getGuildsInfo(guilds, usrID) {
    let info = [];

    for(let i = 0; i < guilds.length; i++) {
        await fetch(`https://api.guildwars2.com/v2/guild/${guilds[i]}?access_token=${usrID}`).then((response) => {
            return response.json();
        }).then((data) => {
            if(data) {
                info.push(data);
            } else {
                console.log('no guild');
            }
        });
    }

    return info;
}