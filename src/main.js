//imports
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const dcConfig = require('../config.json');
const fs = require('fs');
const path = require('path');


//define client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

//define path to commands folders
const commandsPath = path.join(__dirname, 'commands');
const commandsFolders = fs.readdirSync(commandsPath);
const folderPath = new Array();
const commandFiles = new Array();
const commandFilePath = new Array();

client.commands = new Collection();


//get path to command folders
for(const file of commandsFolders) {
    const fPath = path.join(commandsPath, file).replace(/\\/g, '/');    
    folderPath.push(fPath);
}
//get command files
for(const folder of folderPath) {
    const file = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
    commandFiles.push(file);
    for(const cFile of file){
        const filePath = path.join(folder, cFile);
        commandFilePath.push(filePath);
    }
}
//get commands and push in client.commands
for(const file of commandFilePath) {
    const command = require(file);
    if('data' in command && 'execute' in command){
        client.commands.set(command.data.name, command);
    }
}

//log the bot's status
client.once(Events.ClientReady, (c) => {
    console.log(`${c.user.username} ready`);
})

//run commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.log(`Command error: ${error}`);
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error executing the command', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error executing the command', ephemeral: true });
        }
    }
});


//start bot
client.login(dcConfig.token);