if(player == null) {
    await interaction.reply({ 
        content: 'No API added. Click Settings to add one',
        components: [ button ],
        ephemeral: true,
    });
} else {
    const profileEmbed = new EmbedBuilder()
        .setTitle(`Profile - ${interaction.user.username}`)
        .setColor('#22f06d')
        .setDescription('This is your Minerva profile')
        .setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.jpeg`)
        .addFields(
            { name: 'Discord Name', value: `${interaction.user.tag}`}
        )
        
    await interaction.reply({ 
        embeds: [ profileEmbed ], 
        components: [ button ],
        ephemeral: true,
    });            
}

const collectorFilter = i => i.user.id === interaction.user.id;

try {
    const confirm = await rep.awaitMessageComponent({ filter: collectorFilter, time: 60000});

    if(confirm.customId === 'profile_settings') {
        const confirm = await interaction.editReply({ embeds: [ configEmbed ], ephemeral: true, components: []});
        const msgCollector = confirm.channel.createMessageCollector(collectorFilter, { max: 1, time: 60000, maxProcessed: 1 });
        let user_api = '';

        msgCollector.on('collect', async (msg) => {
            msg.delete();
            user_api = msg.content;
            msgCollector.stop();

            try {
                interaction.channel.send({ content: 'Checking you API...' });

                if(user_api != '') {
                    const playerInfo = await fetch(`https://api.guildwars2.com/v2/account?access_token=${user_api}`).then((response) => {
                        return response.json();
                    }).then((data) => {
                        return data;
                    });

                    if(playerInfo === null) {
                        await interaction.channel.followUp({ content: 'API invalid.', ephemeral: true });
                    } else {
                        const player = await mongoAdd(interaction.user.id, user_api, interaction.user.username, playerInfo.name );

                        if(player == null) {
                            console.log("no user were added");
                        } else {                                    
                            return await interaction.followUp({ content: 'Successfully added API', ephemeral: true });
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    const configEmbed = new EmbedBuilder()
        .setTitle('Profile Configuration')
        .setColor('#00fc5c')
        .setDescription('This is the profile configuration')
        .addFields(
            { name: 'API keys', value: 'Config your Guild Wars 2 API Keys'},
        );

} catch (error) {
    await interaction.reply({ content: 'Timed out. Please enter the command again', ephemeral: true});
}