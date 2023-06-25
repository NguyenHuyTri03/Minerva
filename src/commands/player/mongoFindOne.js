const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://vipergtsr323:NHT34Minerva@minervacluster.prbiiny.mongodb.net/?retryWrites=true&w=majority';
const client_db = new MongoClient(uri);
const db = client_db.db('Minerva');
const playerColl = db.collection('Player');

module.exports = async (discordID) => {
    try {
        const player = await playerColl.findOne({discordID: discordID}, function(error, result){
            if(error) return null;

            return result;
        });

        return player;
    } catch (error) {
        console.log(error);
    }
};