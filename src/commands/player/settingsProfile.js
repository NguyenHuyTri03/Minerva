const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.export = async (interaction) => {
    await interaction.deferReply({ephemeral: true});

    const settingMenu = new StringSelectMenuBuilder()
        .setCustomId('heck')
        .setPlaceholder('Choose a setting')
        .addOptions([
            {
                label: 'API keys',
                value: 'APIkey'
            }
        ]);

    const menuAction = new ActionRowBuilder()
        .addComponents(settingMenu);

    await interaction.editReply({ content: 'Temp', components: [menuAction], ephemeral: true });
}