//import
const { REST, Routes } = require('discord.js');
const dcConfig = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

//define path to commands folders
const commandsPath = path.join(__dirname, 'commands');
const commandsFolders = fs.readdirSync(commandsPath);
const folderPath = new Array();
const commandFiles = new Array();
const commandFilePath = new Array();

let commands = [];


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
        commands.push(command.data.toJSON());
    }
}


//register commands
const rest = new REST().setToken(dcConfig.token);

(async () => {
    try {
        console.log('Registering commands...');

        const data = await rest.put(
            Routes.applicationCommands(dcConfig.client_id),
            { body: commands },
        );

        console.log(`Loaded ${data.length} commands`);
        // console.log(commands);
    } catch (error) {
        console.log(`Error registering commands: ${error}`);
    }
})();

// //delete all commands(guild-based)
// rest.put(Routes.applicationGuildCommands(dcConfig.client_id, dcConfig.guild_id), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error);