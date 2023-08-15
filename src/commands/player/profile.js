//imports
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const mongoAdd = require('./mongoAdd');
const mongoFindOne = require('./mongoFindOne');
const { config } = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your current Minerva profile'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        //define Settings button
        const settings = new ButtonBuilder()
            .setCustomId('profile_settings')
            .setLabel('Settings')
            .setStyle(ButtonStyle.Primary);

        const button = new ActionRowBuilder()
            .addComponents(settings);

        //setting embed
        let settingInfo = new EmbedBuilder();

        //setting select menu
        let settingMenu = new StringSelectMenuBuilder();

        //find player info
        const player = await mongoFindOne(interaction.user.id);
        let profileMsg;

        if(player == null) { 
            //no player was found
            profileMsg.Msg = await interaction.editReply({ content: 'No API found. Click settings to add one', components: [button],ephemeral: true });
        } else { 
            //send player Minerva profile
            const profileEmbed = new EmbedBuilder()
            .setTitle('Profile')
            .setDescription('This is your Minerva profile')
            .setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.jpeg`)
            .addFields(
                { name: 'Discord name', value: `${interaction.user.tag}`}
            );

            profileMsg = await interaction.editReply({ embeds: [ profileEmbed ], components: [ button ], ephemeral: true });
        }

        const collector = i => i.user.id === interaction.user.id;

        const confirm = await profileMsg.awaitMessageComponent({ filter: collector, time: 60000});
            
        //get user's current data
        const user = await mongoFindOne(interaction.user.id);
        const apiLen = user.api.length;

        if(confirm.customId == 'profile_settings') {
            
        }

        const selectMenu = new ActionRowBuilder()
            .addComponents(settingMenu);

        interaction.channel.send({ embeds: [settingInfo], components: [selectMenu]});
    },
}

async function sendSelectMenu(interaction){

}