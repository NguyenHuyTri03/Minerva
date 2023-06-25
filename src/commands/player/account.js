//imports
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoFindOne = require('./mongoFindOne');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('account')
        .setDescription('Account related informations')
        .addStringOption( option => option
            .setName('info')
            .setDescription(`Show account's information`)
            .setRequired(true)
            .addChoices(
                { name: 'General', value: 'general' },
                { name: 'PvP', value: 'pvp' },
            )),
    //execute commands
    async execute(interaction) {
        interaction.deferReply({ ephemeral: true });
        const command = interaction.options.getString('info');

        //get player info from mongo
        const player = await mongoFindOne(interaction.user.id);     //find user with discordID
        
        if(player == null) {
            await interaction.editReply({ content: 'API not found. Please use /profile to setup', ephemeral: true});
        } else {
            const api = player.api;
            //account information
            const playerInfo = await fetch(`https://api.guildwars2.com/v2/account?access_token=${api[0]}`).then((response) => {
                return response.json();
            }).then((data) => {
                return data;
            });

            if(command === 'general') {

                const accCreated = new Date(playerInfo.created);
                const currDate = new Date();
                let d = Math.abs(currDate - accCreated);
                let age = d/(1000 * 3600 * 24);
                let ageHour = Math.floor(playerInfo.age / 60 / 60);
                let masteryLevel = await fetch(`https://api.guildwars2.com/v2/account/mastery/points?access_token=${api[0]}`).then((response) => {
                    return response.json();
                }).then((data) => {
                    let total = data.totals;
                    let level = 0;
    
                    for(const mastery of total){
                        level = level + mastery.spent;
                    }
    
                    return level;
                });

                const accountInfoEmbed = new EmbedBuilder()
                    .setColor('#b0bef7')
                    .setTitle(`Account`)
                    .setDescription(`Your GW2 account's information`)
                    .addFields(
                        { name: 'Account name', value: `**${playerInfo.name}**`, inline: true },
                        { name: 'Account age', value: `**${ageHour}** hours across **${Math.floor(age)}** days`, inline: true },
                        { name: 'Mastery level', value: `${masteryLevel}`}
                    )
    
                await interaction.editReply({ embeds: [ accountInfoEmbed ], ephemeral: true});
    
            } else if(command === 'pvp') {
                //account pvp stat
                const pvpInfo = await fetch(`https://api.guildwars2.com/v2/pvp/stats?access_token=${api[0]}`).then((response) => {
                    return response.json();
                }).then((data) => {
                    return data;
                });
    
                let aggregate = pvpInfo.aggregate;
                const playerRank = pvpInfo.pvp_rank;
                const matchesPlayed = aggregate.wins + aggregate.losses + aggregate.desertions + aggregate.byes + aggregate.forfeits;
                const rankedTotal = pvpInfo.ladders.ranked.wins + pvpInfo.ladders.ranked.losses;
                const unrankedTotal = pvpInfo.ladders.unranked.wins + pvpInfo.ladders.unranked.losses;
                const rankedWinRate = (pvpInfo.ladders.ranked.wins / rankedTotal) * 100;
                const unrankedWinRate = (pvpInfo.ladders.unranked.wins / unrankedTotal) * 100;
                let rankID = new Number();
    
                //get ranked ID
                if(playerRank >= 1 && playerRank <= 10) {
                    rankID = 1;
                } else if(playerRank >= 10 && playerRank <= 19) {
                    rankID = 2;
                } else if(playerRank >= 20 && playerRank <= 29) {
                    rankID = 3;
                } else if(playerRank >= 30 && playerRank <= 39) {
                    rankID = 4;
                } else if(playerRank >= 50 && playerRank <= 59) {
                    rankID = 5;
                } else if(playerRank >= 40 && playerRank <= 49) {
                    rankID = 6;
                } else if(playerRank >= 60 && playerRank <= 69) {
                    rankID = 7;
                } else if(playerRank >= 70 && playerRank <= 79) {
                    rankID = 8;
                } else {
                    rankID = 9;
                }
    
                //get rank info
                const pvpRank = await fetch(`https://api.guildwars2.com/v2/pvp/ranks/${rankID}`).then((response) => {
                    return response.json();
                }).then((data) => {
                    return data;
                });

                const pvpEmbed = new EmbedBuilder()
                    .setTitle(`Account: ${playerInfo.name}`)
                    .setColor('#ff0000')
                    .setColor('#ff0000')
                    .setDescription('Your PvP stats')
                    .setThumbnail(pvpRank.icon)
                    .addFields(
                        { name: 'Rank', value: `${playerRank}` },
                        { name: 'Matches played', value: `${matchesPlayed}`},
                        { name: 'Unranked winrate', value: `${unrankedWinRate.toFixed(2)}%`, inline: true},
                        { name: `\t`, value: `\t`, inline: true},
                        { name: 'Ranked winrate', value: `${rankedWinRate.toFixed(2)}%`, inline: true},
                    );
    
                await interaction.editReply({ embeds: [ pvpEmbed ], ephemeral: true});
                // await interaction.editReply({ content: `PvP rank: **${playerRank}**\nMatches played: **${matchesPlayed}**\nUnranked winrate: **${unrankedWinRate.toFixed(2)}%**\nRanked winrate: **${rankedWinRate.toFixed(2)}%**`, ephemeral: true });
    
            } else {
                await interaction.editReply({ content: 'Command Error', ephemeral: true});
            }
        }
    }
};