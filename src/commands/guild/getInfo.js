const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://vipergtsr323:NHT34Minerva@minervacluster.prbiiny.mongodb.net/?retryWrites=true&w=majority';
const client_db = new MongoClient(uri);
const db = client_db.db('Minerva');
const playerColl = db.collection('Guild');

module.export = (id, api) => {
    const guilds = fetch(`https://api.guildwars2.com/v2/account?access_token=${api}`).then((response) => {
        return response.json();
    }).then((data) => {
        return data;
    });

    const guildInfo = fetch(``)
}