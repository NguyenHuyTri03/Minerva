const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://vipergtsr323:NHT34Minerva@minervacluster.prbiiny.mongodb.net/?retryWrites=true&w=majority';
const client_db = new MongoClient(uri);
const db = client_db.db('Minerva');
const playerColl = db.collection('Player');

module.exports = async ( dcID, api, dcName, gw2Name ) => {
    try {
        let obj = {
            gw2name: gw2Name,
            username: dcName,
            discordID: dcID,
            api: [ api ],
        };

        const player = await playerColl.insertOne(obj);

        return player;
    } catch (error) {
        console.log(error);
    }
};